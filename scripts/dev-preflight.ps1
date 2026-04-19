$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$repoRootLower = $repoRoot.ToLowerInvariant()

function Get-ProcessDetails {
  param(
    [int]$ProcessId
  )

  Get-CimInstance Win32_Process -Filter "ProcessId = $ProcessId"
}

function Stop-StaleRepoListener {
  param(
    [int]$Port,
    [string]$ExpectedCommand
  )

  $connections = Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue

  foreach ($connection in $connections) {
    $process = Get-ProcessDetails -ProcessId $connection.OwningProcess
    if ($null -eq $process) {
      continue
    }

    $commandLine = [string]$process.CommandLine
    $normalizedCommand = $commandLine.ToLowerInvariant()

    if ($normalizedCommand.Contains($repoRootLower) -and $normalizedCommand.Contains($ExpectedCommand.ToLowerInvariant())) {
      Write-Host "[dev-preflight] stopping stale process on port $Port (PID $($process.ProcessId))"
      Stop-Process -Id $process.ProcessId -Force
      continue
    }

    throw "Port $Port is already in use by PID $($process.ProcessId): $commandLine"
  }
}

Stop-StaleRepoListener -Port 3000 -ExpectedCommand 'start-server.js'
Stop-StaleRepoListener -Port 8788 -ExpectedCommand 'dev-auth-server.entry.js'
