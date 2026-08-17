param(
    [Parameter(Mandatory = $true)] [string]$Email,
    [Parameter(Mandatory = $true)] [string]$Password,
    [string]$ProductQuery = 'Cable HDMI',
    [int]$ProductId = 32,
    # Alta y sesión son las partes ya verificadas del recorrido. Repetirlas en
    # cada corrida sólo agrega minutos y deja usuarios de prueba tirados en la
    # base: con esto se entra con una cuenta que ya existe y el tiempo se gasta
    # en lo que todavía no se probó.
    [switch]$CuentaExistente,
    # El alta de dirección es el único formulario largo que queda, y escribir en
    # un teléfono por coordenadas es la parte más frágil de todo esto. Con una
    # dirección ya cargada, el recorrido de compra queda hecho sólo de botones.
    [switch]$DireccionExistente,
    # Con la sesión ya abierta no hace falta borrar los datos de la app ni pasar
    # por el único formulario que queda. Escribir por coordenadas en un teléfono
    # es la parte más frágil del recorrido; esto la saca del camino cuando lo que
    # se quiere probar es la compra.
    [switch]$SesionIniciada
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$adb = Join-Path $root 'artifacts\tools\android-platform-tools\platform-tools\adb.exe'
$evidence = Join-Path $root 'artifacts\device-e2e\run'
New-Item -ItemType Directory -Force -Path $evidence | Out-Null

# Función simple a propósito: con un param() tipado, PowerShell intenta enlazar
# los flags de adb como parámetros propios y "monkey -p" aborta con "el nombre
# de parámetro 'p' es ambiguo".
function Adb {
    & $adb @args
    if ($LASTEXITCODE -ne 0) { throw "ADB falló: $($args -join ' ')" }
}

# Leer la pantalla ocurre decenas de veces mientras se espera un elemento;
# sacarle una captura a cada sondeo multiplicaba por cinco lo que tarda el
# recorrido. La imagen sólo se necesita cuando la pantalla es evidencia.
function Read-Ui([string]$Name = 'current') {
    $destino = Join-Path $evidence "$Name.xml"
    # Un volcado puede salir incompleto o no salir: uiautomator falla si la
    # pantalla está animándose. Devolver eso como si fuera la pantalla haría
    # creer que el elemento buscado no existe, cuando lo que falló fue la lectura.
    for ($intento = 1; $intento -le 3; $intento++) {
        & $adb shell uiautomator dump /sdcard/techstore-e2e.xml 2>&1 | Out-Null
        & $adb pull /sdcard/techstore-e2e.xml $destino 2>&1 | Out-Null
        if (Test-Path -LiteralPath $destino) {
            try { return [xml](Get-Content -LiteralPath $destino) } catch { }
        }
        Start-Sleep -Milliseconds 700
    }
    throw 'No se pudo leer la pantalla del dispositivo'
}

function Dump([string]$Name) {
    $ui = Read-Ui $Name
    # screencap al teléfono y después pull: redirigir exec-out con ">" pasa el
    # PNG por el decodificador de texto de PowerShell y lo deja corrupto.
    Adb shell screencap -p /sdcard/techstore-e2e.png | Out-Null
    Adb pull /sdcard/techstore-e2e.png (Join-Path $evidence "$Name.png") | Out-Null
    $ui
}

function Find-Node([xml]$Ui, [string]$Value) {
    @($Ui.GetElementsByTagName('node') | Where-Object {
        $_.text -eq $Value -or $_.'content-desc' -eq $Value -or $_.'resource-id' -eq $Value -or
        $_.'resource-id' -eq "com.techstore.mobile:id/$Value"
    }) | Sort-Object -Property @{ Expression = { if ($_.'clickable' -eq 'true') { 0 } else { 1 } } },
        @{ Expression = {
            if ($_.bounds -match '^\[(\d+),(\d+)\]\[(\d+),(\d+)\]$' -and
                [int]$Matches[3] -gt [int]$Matches[1] -and [int]$Matches[4] -gt [int]$Matches[2]) { 0 } else { 1 }
        } } | Select-Object -First 1
}

function Center($Node) {
    if ($Node.bounds -notmatch '^\[(\d+),(\d+)\]\[(\d+),(\d+)\]$') { throw "Bounds inválidos: $($Node.bounds)" }
    [pscustomobject]@{ X = ([int]$Matches[1] + [int]$Matches[3]) / 2; Y = ([int]$Matches[2] + [int]$Matches[4]) / 2 }
}

# Al salir de un campo de contraseña, Google ofrece guardarla y ese diálogo se
# monta encima de la app: tapa el botón de enviar y el recorrido se cae sin que
# haya nada roto en TechStore. Se descarta con "ahora no", que no guarda nada.
function Dismiss-SystemDialog([xml]$Ui) {
    $descartar = @($Ui.GetElementsByTagName('node') | Where-Object {
        $_.'resource-id' -eq 'android:id/autofill_save_no' -or
        $_.'resource-id' -eq 'com.google.android.gms:id/cancel'
    }) | Select-Object -First 1
    if (-not $descartar) { return $false }
    $punto = Center $descartar
    Adb shell input tap ([int]$punto.X) ([int]$punto.Y) | Out-Null
    Start-Sleep -Milliseconds 700
    return $true
}

function Wait-Node([string]$Value, [int]$TimeoutSeconds = 20) {
    $limit = (Get-Date).AddSeconds($TimeoutSeconds)
    do {
        $ui = Read-Ui
        if (Dismiss-SystemDialog $ui) { $ui = Read-Ui }
        $node = Find-Node $ui $Value
        if ($node) { return $node }
        Start-Sleep -Milliseconds 700
    } while ((Get-Date) -lt $limit)
    throw "No apareció '$Value'"
}

# Un elemento que quedó fuera de la vista sigue estando en el árbol, pero sin
# medidas: bounds [0,0][0,0]. Su centro entonces es la esquina de la pantalla, y
# el toque se va a cualquier lado sin que nada avise. Hay que traerlo a la vista
# antes de tocarlo.
function Test-Renderizado($Node) {
    if (-not $Node) { return $false }
    if ($Node.bounds -notmatch '^\[(\d+),(\d+)\]\[(\d+),(\d+)\]$') { return $false }
    return ([int]$Matches[3] -gt [int]$Matches[1]) -and ([int]$Matches[4] -gt [int]$Matches[2])
}

# Tocar unas coordenadas leídas de una pantalla que todavía se está acomodando es
# tirarle a un blanco móvil. Se espera a que el elemento aparezca dos veces
# seguidas en el mismo lugar antes de confiar en su posición.
function Wait-StableNode([string]$Value, [int]$TimeoutSeconds = 20) {
    $node = Wait-Node $Value $TimeoutSeconds

    for ($desplazamiento = 0; $desplazamiento -lt 6; $desplazamiento++) {
        if (Test-Renderizado $node) { break }
        Adb shell input swipe 540 1700 540 1000 300 | Out-Null
        Start-Sleep -Milliseconds 800
        $node = Wait-Node $Value $TimeoutSeconds
    }
    if (-not (Test-Renderizado $node)) { throw "'$Value' existe pero nunca quedó visible en pantalla" }

    for ($i = 0; $i -lt 6; $i++) {
        Start-Sleep -Milliseconds 350
        $otra = Find-Node (Read-Ui) $Value
        if (-not (Test-Renderizado $otra)) { continue }
        if ($otra.bounds -eq $node.bounds) { return $otra }
        $node = $otra
    }
    return $node
}

function Tap([string]$Value, [int]$TimeoutSeconds = 20) {
    $tabs = @{ Inicio = 108; Buscar = 324; Carrito = 540; Pedidos = 756; Cuenta = 972 }
    if ($tabs.ContainsKey($Value)) {
        Adb shell input tap $tabs[$Value] 2200 | Out-Null
        Start-Sleep -Milliseconds 900
        return
    }
    # En una lista virtualizada, lo que está fuera de la vista no está montado: no
    # es que el elemento esté escondido, es que todavía no existe. Buscarlo sin
    # desplazar da "no apareció" para siempre, aunque esté a un dedo de distancia.
    $node = $null
    for ($i = 0; $i -lt 6; $i++) {
        try {
            $node = Wait-StableNode $Value ([Math]::Min($TimeoutSeconds, 8))
            break
        } catch { }
        Adb shell input swipe 540 1700 540 900 300 | Out-Null
        Start-Sleep -Milliseconds 900
    }
    if (-not $node) { throw "No se pudo alcanzar '$Value' ni desplazando la pantalla" }

    $point = Center $node
    Adb shell input tap ([int]$point.X) ([int]$point.Y) | Out-Null
    Start-Sleep -Milliseconds 900
}

# Entre que se lee la pantalla y se toca, el formulario se mueve: al validarse un
# campo aparece o desaparece su mensaje de ayuda y todo lo de abajo salta unos
# treinta píxeles. Si el toque sale justo en esa transición, cae al lado del
# campo y el foco no se mueve.
#
# Escribir entonces es peor que no hacer nada, porque "input text" va a donde
# esté el foco: el texto termina concatenado en el campo anterior y el error
# recién aparece dos pasos después. Por eso primero se confirma el foco y sólo
# entonces se escribe.
# Tocar un botón puede mover el botón: al perder el foco el campo que estaba
# editándose, su mensaje de ayuda desaparece y todo lo de abajo sube unos treinta
# píxeles, justo mientras el toque va en camino. El primer intento cae al vacío
# sin que nada falle. Con la pantalla ya en reposo, el segundo acierta.
function Tap-Until([string]$Value, [string]$Expected, [int]$Intentos = 3, [int]$TimeoutSeconds = 25) {
    for ($i = 1; $i -le $Intentos; $i++) {
        Tap $Value
        try { return Wait-Node $Expected $TimeoutSeconds }
        catch { if ($i -eq $Intentos) { throw } }
    }
}

function Enter([string]$Id, [string]$Value) {
    for ($intento = 1; $intento -le 4; $intento++) {
        # Si tocar no alcanza, se pasa al campo con el tabulador: mueve el foco al
        # siguiente elemento del formulario sin depender de ninguna coordenada, así
        # que es inmune a que la pantalla se haya corrido.
        try {
            if ($intento -le 2) { Tap $Id } else { Adb shell input keyevent 61 | Out-Null }
        } catch {
            # El campo siguiente suele quedar debajo del teclado que abrió el campo
            # anterior, y lo que está tapado no aparece en el árbol: no es que no
            # exista, es que no se lo puede ver. Se cierra el teclado y se reintenta.
            Adb shell input keyevent 111 | Out-Null
            Start-Sleep -Milliseconds 600
            continue
        }
        Start-Sleep -Milliseconds 400
        $campo = Find-Node (Read-Ui) $Id
        if ($campo.focused -ne 'true') { continue }
        Adb shell input text $Value | Out-Null
        Start-Sleep -Milliseconds 500
        $campo = Find-Node (Read-Ui) $Id
        if ($campo.text -and $campo.text.Trim()) { return }
    }
    throw "No se pudo escribir en el campo '$Id'"
}

function Save([string]$Name, [string]$Expected) {
    $ui = Dump $Name
    if (Dismiss-SystemDialog $ui) { $ui = Dump $Name }
    if (-not (Find-Node $ui $Expected)) { throw "Evidencia '$Name' no contiene '$Expected'" }
    "PASS $Name => $Expected"
}

function Invoke-Recorrido {
    # Sin borrar los datos, la app vuelve donde la dejó la corrida anterior: si
    # esa terminó en el formulario de registro, el recorrido arranca ahí y no en
    # la home. Un E2E tiene que partir siempre del mismo estado, y acá no se
    # pierde nada: cada corrida crea su propio usuario.
    if (-not $SesionIniciada) { Adb shell pm clear com.techstore.mobile | Out-Null }
    else { Adb shell am force-stop com.techstore.mobile | Out-Null }
    Adb shell monkey -p com.techstore.mobile -c android.intent.category.LAUNCHER 1 | Out-Null

    # Conservar la sesión implica conservar también la pantalla donde quedó la
    # corrida anterior, que puede ser el detalle de un producto: ahí no está la
    # barra de pestañas y el recorrido no tiene desde dónde empezar. Se vuelve a
    # la raíz con "atrás", que no toca la sesión.
    if ($SesionIniciada) {
        Start-Sleep -Seconds 8
        for ($i = 0; $i -lt 4; $i++) {
            if (Find-Node (Read-Ui) 'Inicio') { break }
            Adb shell input keyevent 4 | Out-Null
            Start-Sleep -Milliseconds 1200
        }
    }
    # Arranque en frío: splash, runtime nativo y bundle JavaScript. Una espera
    # fija alcanzaba con la app caliente y en frío dejaba un dump vacío, que se
    # leía como "la pantalla no dice Inicio" cuando todavía no había pantalla.
    Wait-Node 'Inicio' 90 | Out-Null
    Save '01-launch' 'Inicio'

    if (-not $SesionIniciada) {
    Tap 'Cuenta'
    Tap 'Iniciar sesión'

    if (-not $CuentaExistente) {
        Tap 'login-register'
        Save '02-register' 'Crear cuenta'
        Enter 'register-nombre' 'Cliente'
        Enter 'register-apellido' 'E2E'
        Enter 'register-email' $Email
        Enter 'register-password' $Password
        Enter 'register-confirm-password' $Password
        Tap-Until 'register-submit' 'Mi cuenta' 3 25 | Out-Null
        Save '03-account' 'Cliente E2E'

        Tap 'Cerrar sesión'
        Wait-Node 'Iniciar sesión' 20 | Out-Null
        Tap 'Iniciar sesión'
    }

    Enter 'login-email' $Email
    Enter 'login-password' $Password
    Tap-Until 'login-submit' 'Mi cuenta' 3 25 | Out-Null
    Save '04-login' 'Cliente E2E'
    }

    Tap 'Buscar'
    Enter 'catalog-search' ($ProductQuery -replace ' ', '%s')
    Tap "catalog-product-$ProductId" 25
    Save '05-product' 'Producto'
    # El favorito sobrevive a la corrida anterior, así que el botón puede estar en
    # cualquiera de los dos estados. Dar por sentado uno hacía fallar el recorrido
    # por una diferencia que no es un error. Si ya estaba marcado se prueba el ida
    # y vuelta completo, que además verifica más que marcarlo una sola vez.
    if (Find-Node (Read-Ui) 'Quitar de favoritos') {
        Tap-Until 'Quitar de favoritos' 'Guardar en favoritos' 3 20 | Out-Null
    }
    Tap-Until 'Guardar en favoritos' 'Quitar de favoritos' 3 20 | Out-Null
    Save '06-favorite' 'Quitar de favoritos'
    Tap-Until 'product-add-to-cart' 'cart-checkout' 3 25 | Out-Null
    Save '07-cart' 'Precio y disponibilidad verificados por TechStore'
    Tap-Until 'cart-checkout' 'Dirección de entrega' 3 20 | Out-Null
    if (-not $DireccionExistente) {
        Tap 'Agregar dirección'
        Enter 'address-nombreDestinatario' 'Cliente E2E'
        Enter 'address-telefono' '0981123456'
        Enter 'address-departamento' 'Central'
        Enter 'address-ciudad' 'San%sLorenzo'
        Enter 'address-direccionLinea1' 'Avenida%sE2E%s123'
        Enter 'address-referencia' 'Prueba%sautomatizada%sTechStore'
        Tap-Until 'address-save' 'address-continue' 3 25 | Out-Null
    }
    Save '08-address' 'Cliente E2E'
    # La señal de que se llegó a Entrega tiene que ser algo visible de entrada: el
    # botón de continuar queda debajo de las cuatro tarifas y no se ve sin
    # desplazar, así que esperarlo hacía creer que el paso no había avanzado
    # cuando en realidad ya estaba en la pantalla siguiente.
    Tap-Until 'address-continue' 'Método de entrega' 3 25 | Out-Null
    $shippingUi = Dump '09-shipping'
    # Los identificadores llegan a veces con el paquete adelante y a veces pelados,
    # según la pantalla; buscar sólo la forma larga dejaba las tarifas invisibles.
    $rate = $shippingUi.GetElementsByTagName('node') | Where-Object {
        $_.'resource-id' -like 'shipping-rate-*' -or $_.'resource-id' -like '*:id/shipping-rate-*'
    } | Where-Object { Test-Renderizado $_ } | Select-Object -First 1
    if (-not $rate) { throw 'No se encontró una tarifa de envío' }
    $ratePoint = Center $rate
    Adb shell input tap ([int]$ratePoint.X) ([int]$ratePoint.Y) | Out-Null
    Start-Sleep -Milliseconds 900
    Tap-Until 'shipping-continue' 'payment-PAGO_EN_LOCAL' 3 25 | Out-Null
    Tap 'payment-PAGO_EN_LOCAL'
    # Elegir el método de pago ya lleva al resumen: buscar después un botón de
    # "continuar" que en esa pantalla no existe hacía fallar un paso que en
    # realidad había salido bien.
    if (-not (Find-Node (Read-Ui) 'checkout-confirm')) {
        Tap-Until 'payment-continue' 'checkout-confirm' 3 25 | Out-Null
    }
    Save '10-review' 'Confirmar pedido'

    'DEVICE_E2E_READY_FOR_CHECKOUT'
}

if (-not (Test-Path -LiteralPath $adb)) { throw 'ADB no está disponible' }
if (-not (& $adb devices | Select-String '\sdevice$' | Select-Object -First 1)) { throw 'No hay Android autorizado' }

# El teclado virtual es el enemigo de un recorrido por coordenadas: el dump de
# uiautomator describe el layout entero, incluida la franja que el teclado tapa,
# así que un toque dirigido a un campo de abajo termina pegando sobre una tecla
# —o sobre la barra de sugerencias, que abre los ajustes de Gboard—. Se apaga el
# método de entrada mientras dura la prueba: "input text" inyecta los caracteres
# igual, porque no depende del teclado en pantalla.
$ime = (& $adb shell settings get secure default_input_method 2>$null).Trim()

# uiautomator se niega a volcar la pantalla mientras haya una animación en curso
# y aborta con "could not get idle state": un spinner de carga basta para que el
# recorrido no vea nunca la pantalla que está esperando. Apagar las animaciones
# es el requisito habitual de las suites de UI en Android.
$escalas = @('window_animation_scale', 'transition_animation_scale', 'animator_duration_scale')
$previas = @{}
foreach ($escala in $escalas) {
    $valor = (& $adb shell settings get global $escala 2>$null).Trim()
    $previas[$escala] = if ($valor -and $valor -ne 'null') { $valor } else { '1' }
}

try {
    if ($ime -and $ime -ne 'null') {
        & $adb shell ime disable $ime | Out-Null
        Start-Sleep -Milliseconds 800
    }
    foreach ($escala in $escalas) { & $adb shell settings put global $escala 0 | Out-Null }
    # Si la pantalla se apaga a mitad del recorrido, MIUI corta la depuración y el
    # dispositivo desaparece. Mientras esté enchufado, se queda despierto.
    & $adb shell svc power stayon usb | Out-Null
    Invoke-Recorrido
} finally {
    # Pase lo que pase, el teléfono se devuelve como estaba: con su teclado y sus
    # animaciones. Dejarlo tocado por una prueba fallida sería peor que no
    # haberla corrido.
    #
    # Si el cable se soltó a mitad del recorrido, esto corre sin dispositivo y no
    # restaura nada: el teléfono se queda sin teclado, que es exactamente el
    # estado en el que no se puede usar. Por eso espera a que vuelva, y si no
    # vuelve avisa con las órdenes exactas para arreglarlo a mano.
    $limite = (Get-Date).AddSeconds(60)
    do {
        $hayDispositivo = @(& $adb devices 2>$null | Select-String 'device$').Count -gt 0
        if ($hayDispositivo) { break }
        Start-Sleep -Seconds 3
    } while ((Get-Date) -lt $limite)

    if ($hayDispositivo) {
        & $adb shell svc power stayon false | Out-Null
        foreach ($escala in $escalas) { & $adb shell settings put global $escala $previas[$escala] | Out-Null }
        if ($ime -and $ime -ne 'null') {
            & $adb shell ime enable $ime | Out-Null
            & $adb shell ime set $ime | Out-Null
        }
    } else {
        Write-Warning "El dispositivo no volvió: quedó sin teclado y sin animaciones. Reconectalo y ejecutá:"
        Write-Warning "  adb shell ime enable $ime"
        Write-Warning "  adb shell ime set $ime"
        foreach ($escala in $escalas) { Write-Warning "  adb shell settings put global $escala $($previas[$escala])" }
    }
}
