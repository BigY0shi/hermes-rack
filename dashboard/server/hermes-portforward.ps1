# hermes-portforward.ps1
# ─────────────────────────────────────────────────────────────────────────────
# Forwards Windows LAN port 7777 → WSL's hermes-bridge.
# Run as Administrator. Idempotent — safe to re-run after WSL restarts / IP changes.
#
# Install (first time, as Admin):
#   powershell -ExecutionPolicy Bypass -File .\hermes-portforward.ps1 -Install
#
# Re-apply (after reboot or WSL IP change):
#   powershell -ExecutionPolicy Bypass -File .\hermes-portforward.ps1
#
# Remove everything:
#   powershell -ExecutionPolicy Bypass -File .\hermes-portforward.ps1 -Remove
#
# Status:
#   powershell -ExecutionPolicy Bypass -File .\hermes-portforward.ps1 -Status
# ─────────────────────────────────────────────────────────────────────────────

param(
    [switch]$Install,       # install Task Scheduler job to auto-run on login
    [switch]$Remove,        # tear down port proxy, firewall rule, and task
    [switch]$Status,        # print current state
    [int]$Port    = 7777,
    [string]$Distro = 'Ubuntu',   # your WSL distro name (run `wsl -l -v` to check)
    [string]$RuleName = 'Hermes Bridge 7777',
    [string]$TaskName = 'HermesBridgePortForward'
)

# Require admin for anything that mutates
function Assert-Admin {
    $current = [Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
    if (-not $current.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        Write-Host "✗ Must run as Administrator." -ForegroundColor Red
        exit 1
    }
}

function Get-WSLIP {
    param([string]$Distro)
    # Prefer eth0 (the default WSL2 interface). Fall back to parsing `hostname -I`.
    $ip = (wsl -d $Distro -- bash -c "ip -4 addr show eth0 2>/dev/null | awk '/inet / {print \$2}' | cut -d/ -f1").Trim()
    if (-not $ip) {
        $ip = (wsl -d $Distro -- bash -c "hostname -I | awk '{print \$1}'").Trim()
    }
    return $ip
}

function Show-Status {
    Write-Host ""
    Write-Host "── Hermes port-forward status ─────────────────────────────" -ForegroundColor Cyan

    $wslIp = Get-WSLIP -Distro $Distro
    Write-Host "WSL distro      : $Distro"
    Write-Host "WSL IP          : $(if ($wslIp) {$wslIp} else {'(not running?)'})"
    Write-Host "Port            : $Port"
    Write-Host ""

    Write-Host "── portproxy entries ─────────────────────────" -ForegroundColor Cyan
    $proxy = netsh interface portproxy show v4tov4 | Out-String
    if ($proxy -match "$Port") { Write-Host $proxy } else { Write-Host "(none on port $Port)" }

    Write-Host "── firewall rule ─────────────────────────────" -ForegroundColor Cyan
    $rule = Get-NetFirewallRule -DisplayName $RuleName -ErrorAction SilentlyContinue
    if ($rule) {
        Write-Host "  '$RuleName' : $($rule.Enabled), $($rule.Direction), $($rule.Action)"
    } else {
        Write-Host "  (no rule named '$RuleName')"
    }

    Write-Host "── scheduled task ────────────────────────────" -ForegroundColor Cyan
    $task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($task) {
        Write-Host "  '$TaskName' : $($task.State)"
    } else {
        Write-Host "  (no task named '$TaskName')"
    }

    Write-Host "── connectivity probe ────────────────────────" -ForegroundColor Cyan
    if ($wslIp) {
        try {
            $r = Invoke-WebRequest -Uri "http://$($wslIp):$Port/health" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
            Write-Host "  WSL direct : HTTP $($r.StatusCode)" -ForegroundColor Green
        } catch {
            Write-Host "  WSL direct : FAIL — $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
    # LAN IPs
    $lanIps = Get-NetIPAddress -AddressFamily IPv4 -PrefixOrigin Dhcp,Manual -ErrorAction SilentlyContinue |
              Where-Object { $_.IPAddress -notlike '169.*' -and $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '172.*' -and $_.IPAddress -ne $wslIp } |
              Select-Object -ExpandProperty IPAddress -Unique
    foreach ($ip in $lanIps) {
        try {
            $r = Invoke-WebRequest -Uri "http://$($ip):$Port/health" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
            Write-Host "  LAN $ip : HTTP $($r.StatusCode)" -ForegroundColor Green
        } catch {
            Write-Host "  LAN $ip : FAIL" -ForegroundColor Yellow
        }
    }
    Write-Host ""
}

function Add-Forward {
    $wslIp = Get-WSLIP -Distro $Distro
    if (-not $wslIp) {
        Write-Host "✗ Could not determine WSL IP. Is the '$Distro' distro running?" -ForegroundColor Red
        Write-Host "  Tip: wsl -d $Distro -- echo ok" -ForegroundColor DarkGray
        exit 2
    }
    Write-Host "→ WSL IP: $wslIp"

    # Reset the portproxy entry (delete any stale one, then add fresh)
    Write-Host "→ Updating portproxy 0.0.0.0:$Port → $($wslIp):$Port"
    netsh interface portproxy delete v4tov4 listenport=$Port listenaddress=0.0.0.0 | Out-Null
    $out = netsh interface portproxy add v4tov4 listenport=$Port listenaddress=0.0.0.0 connectport=$Port connectaddress=$wslIp
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ portproxy add failed: $out" -ForegroundColor Red
        exit 3
    }

    # Firewall rule (only create if missing — we reuse across reboots)
    $existing = Get-NetFirewallRule -DisplayName $RuleName -ErrorAction SilentlyContinue
    if (-not $existing) {
        Write-Host "→ Adding firewall rule '$RuleName'"
        New-NetFirewallRule `
            -DisplayName $RuleName `
            -Direction Inbound `
            -Action Allow `
            -Protocol TCP `
            -LocalPort $Port `
            -Profile Private,Domain `
            -Description 'Hermes Bridge: WSL hermes-bridge on port 7777' | Out-Null
    } else {
        Write-Host "→ Firewall rule already present"
    }

    Write-Host "✓ Forward active." -ForegroundColor Green
    Write-Host ""
    Write-Host "Reachable at:"
    Get-NetIPAddress -AddressFamily IPv4 -PrefixOrigin Dhcp,Manual -ErrorAction SilentlyContinue |
        Where-Object { $_.IPAddress -notlike '169.*' -and $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '172.*' -and $_.IPAddress -ne $wslIp } |
        ForEach-Object { Write-Host "  http://$($_.IPAddress):$Port" }
    Write-Host ""
}

function Install-Task {
    Assert-Admin
    Add-Forward

    # Run this script at every user login, using SYSTEM identity so it doesn't prompt
    $scriptPath = $PSCommandPath
    if (-not $scriptPath) { $scriptPath = $MyInvocation.MyCommand.Path }
    $scriptPath = (Resolve-Path $scriptPath).Path

    $action    = New-ScheduledTaskAction -Execute 'powershell.exe' `
                    -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$scriptPath`""
    $trigger1  = New-ScheduledTaskTrigger -AtStartup
    $trigger2  = New-ScheduledTaskTrigger -AtLogOn
    $settings  = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
                    -StartWhenAvailable -RestartInterval (New-TimeSpan -Minutes 2) -RestartCount 3
    $principal = New-ScheduledTaskPrincipal -UserId 'SYSTEM' -RunLevel Highest

    # Remove existing task if present so we upsert cleanly
    if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    }

    Register-ScheduledTask -TaskName $TaskName `
        -Action $action -Trigger @($trigger1, $trigger2) -Settings $settings -Principal $principal `
        -Description 'Re-applies Hermes Bridge port forwarding after reboot or WSL IP change' | Out-Null

    Write-Host "✓ Scheduled task '$TaskName' installed. Runs at boot + login." -ForegroundColor Green
    Write-Host ""
    Write-Host "Manual re-run if WSL IP changes mid-session:"
    Write-Host "  Start-ScheduledTask -TaskName $TaskName" -ForegroundColor DarkGray
    Write-Host ""
}

function Remove-All {
    Assert-Admin
    Write-Host "→ Removing portproxy"
    netsh interface portproxy delete v4tov4 listenport=$Port listenaddress=0.0.0.0 | Out-Null

    Write-Host "→ Removing firewall rule"
    Get-NetFirewallRule -DisplayName $RuleName -ErrorAction SilentlyContinue | Remove-NetFirewallRule

    Write-Host "→ Removing scheduled task"
    if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    }
    Write-Host "✓ Removed." -ForegroundColor Green
}

# ── Dispatch ──
if ($Status)  { Show-Status; exit 0 }
if ($Remove)  { Remove-All; exit 0 }
if ($Install) { Install-Task; Show-Status; exit 0 }

# Default: re-apply forward (no admin needed for portproxy only on some systems,
# but we enforce it because New-NetFirewallRule requires it on first run).
Assert-Admin
Add-Forward
