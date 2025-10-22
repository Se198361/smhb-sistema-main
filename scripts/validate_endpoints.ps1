$ErrorActionPreference = 'Stop'

function GetCount($resp) {
  try {
    if ($null -eq $resp) { return 0 }
    if ($resp.PSObject.Properties.Name -contains 'data') { return ($resp.data | Measure-Object).Count }
    else { return ($resp | Measure-Object).Count }
  } catch { return 0 }
}

$summary = [ordered]@{}

# Health
try {
  $health = Invoke-RestMethod -Uri 'http://localhost:3001/health' -Method Get
  $summary['health'] = @{ status = 'ok'; ok = $health.ok }
} catch {
  $summary['health'] = @{ status = 'error'; message = $_.Exception.Message }
}

# Endpoints
$urls = [ordered]@{
  avisos = 'http://localhost:3001/api/avisos?page=1&pageSize=5';
  membros = 'http://localhost:3001/api/membros?page=1&pageSize=5';
  eventos = 'http://localhost:3001/api/eventos?page=1&pageSize=5';
  diretoria = 'http://localhost:3001/api/diretoria';
  financas = 'http://localhost:3001/api/financas?page=1&pageSize=5';
  conteudos = 'http://localhost:3001/api/conteudos?page=1&pageSize=5';
  templatesCrachasFront = 'http://localhost:3001/api/templates?page=CRACHAS&lado=front';
  templatesCrachasBack = 'http://localhost:3001/api/templates?page=CRACHAS&lado=back';
  templatesEmbaixadores = 'http://localhost:3001/api/templates?page=EMBAIXADORES';
  crachas = 'http://localhost:3001/api/crachas?page=1&pageSize=5';
  embaixadores = 'http://localhost:3001/api/embaixadores?page=1&pageSize=5';
}

foreach ($k in $urls.Keys) {
  try {
    $resp = Invoke-RestMethod -Uri $urls[$k] -Method Get
    $count = GetCount $resp
    $summary[$k] = @{ status = 'ok'; count = $count }
  } catch {
    $summary[$k] = @{ status = 'error'; message = $_.Exception.Message }
  }
}

# Auth flow
try {
  $email = 'trae-test+' + ([System.Guid]::NewGuid().ToString().Substring(0,8)) + '@local.invalid'
  $password = 'TestPwd123!'
  $regBody = @{ nome = 'Trae Test'; email = $email; password = $password } | ConvertTo-Json
  $reg = Invoke-RestMethod -Uri 'http://localhost:3001/api/auth/register' -Method Post -Body $regBody -ContentType 'application/json'
  $loginBody = @{ email = $email; password = $password } | ConvertTo-Json
  $login = Invoke-RestMethod -Uri 'http://localhost:3001/api/auth/login' -Method Post -Body $loginBody -ContentType 'application/json'
  $token = $login.token
  $me = Invoke-RestMethod -Uri 'http://localhost:3001/api/auth/me' -Method Get -Headers @{ Authorization = ('Bearer ' + $token) }
  $summary['auth'] = @{ status = 'ok'; user = $me.user.email }
} catch {
  $summary['auth'] = @{ status = 'error'; message = $_.Exception.Message }
}

$summary | ConvertTo-Json -Depth 4 | Write-Output