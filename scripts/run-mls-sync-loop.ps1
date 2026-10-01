# scripts/run-mls-sync-loop.ps1
#
# Dispara /api/cron/mls-sync repetidamente (padrão: a cada 2 minutos) para
# acelerar o backfill inicial do banco, sem precisar do Cron nativo da
# Vercel (Hobby plan permite só 1x/dia).
#
# Cada chamada HTTP é uma requisição comum (não conta como "cron job" nem
# consome o limite de agendamento da Vercel) e a própria rota já respeita
# o throttle de 600ms do MLSGrid e processa no máximo 3 páginas por
# execução — então rodar isso em loop não corre risco de estourar o
# rate limit do MLSGrid nem o timeout de 60s da função.
#
# Uso:
#   .\scripts\run-mls-sync-loop.ps1 -CronSecret "SEU_CRON_SECRET"
#
# Pare com Ctrl+C a qualquer momento — é seguro interromper, a próxima
# execução continua de onde o cursor (mlsSyncState) parou.

param(
    [Parameter(Mandatory = $true)]
    [string]$CronSecret,

    [string]$BaseUrl = "https://www.4riversrealty.us",

    [int]$IntervalSeconds = 120
)

$ErrorActionPreference = "Stop"
$url = "$BaseUrl/api/cron/mls-sync"
$headers = @{ Authorization = "Bearer $CronSecret" }

Write-Host "Iniciando loop de sync a cada $IntervalSeconds segundos contra $url"
Write-Host "Pressione Ctrl+C para parar."

while ($true) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    try {
        $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get -TimeoutSec 65
        $stats = $response | ConvertTo-Json -Compress
        Write-Host "[$timestamp] OK: $stats"
    }
    catch {
        Write-Host "[$timestamp] ERRO: $($_.Exception.Message)"
    }

    Start-Sleep -Seconds $IntervalSeconds
}
