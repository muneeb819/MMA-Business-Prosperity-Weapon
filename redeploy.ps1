$ErrorActionPreference = "Continue"
$env:PATH = "$env:PATH;C:\Program Files\nodejs"
$projectDir = "C:\Users\OC\Documents\Default Project\full-repo"
$log = "C:\Users\OC\AppData\Local\Temp\opencode\redeploy.log"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Set-Location $projectDir

try {
    $out = npx vercel --prod --yes 2>&1 | Out-String
    Add-Content $log "$timestamp : OUT -> $out"
    if ($out -match "Resource is limited" -or $out -match "api-deployments-free-per-day") {
        $next = (Get-Date).AddHours(1)
        $st = $next.ToString("HH:mm")
        $sd = $next.ToString("MM/dd/yyyy")
        $bs = [char]92; $q = [char]34
        $tr = "powershell -NoProfile -ExecutionPolicy Bypass -File $bs$q" + $PSCommandPath + "$bs$q"
        schtasks /Create /TN "MBPW-Redeploy" /TR $tr /SC ONCE /ST $st /SD $sd /F | Out-Null
        Add-Content $log "$timestamp : RATE LIMITED -> rescheduled for $st $sd"
    } else {
        Add-Content $log "$timestamp : DEPLOY SUCCEEDED"
    }
} catch {
    Add-Content $log "$timestamp : ERROR -> $_"
    $next = (Get-Date).AddHours(1)
    $bs = [char]92; $q = [char]34
    $tr = "powershell -NoProfile -ExecutionPolicy Bypass -File $bs$q" + $PSCommandPath + "$bs$q"
    schtasks /Create /TN "MBPW-Redeploy" /TR $tr /SC ONCE /ST $next.ToString("HH:mm") /SD $next.ToString("MM/dd/yyyy") /F | Out-Null
}
