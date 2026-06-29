param(
    [Parameter(Position = 0)]
    [ValidateSet('build','up','down','shell','install','dev','test','test-unit','test-e2e','lint','typecheck','logs','clean','exec')]
    [string]$Command = 'up',
    [Parameter(Position = 1, ValueFromRemainingArguments = $true)]
    [string[]]$Arguments
)

$ErrorActionPreference = 'Stop'
$compose = @('compose')

function Invoke-Docker([string[]]$DockerArgs) {
    & docker @DockerArgs
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

function Invoke-Workspace([string[]]$WorkspaceArgs) {
    Invoke-Docker ($compose + @('exec', 'workspace', 'bash', '-lc', ($WorkspaceArgs -join ' ')))
}

switch ($Command) {
    'build'     { Invoke-Docker ($compose + @('build', 'workspace')) }
    'up'        { Invoke-Docker ($compose + @('up', '-d', 'workspace')) }
    'down'      { Invoke-Docker ($compose + @('down')) }
    'shell'     { Invoke-Docker ($compose + @('exec', 'workspace', 'bash')) }
    'install'   { Invoke-Workspace @('pnpm install') }
    'dev'       { Invoke-Docker ($compose + @('up', 'workspace')) }
    'test'      { Invoke-Workspace @('pnpm test') }
    'test-unit' { Invoke-Workspace @('pnpm test') }
    'test-e2e'  { Invoke-Docker ($compose + @('--profile', 'test', 'run', '--rm', 'e2e')) }
    'lint'      { Invoke-Workspace @('pnpm lint') }
    'typecheck' { Invoke-Workspace @('pnpm typecheck') }
    'logs'      { Invoke-Docker ($compose + @('logs', '-f', 'workspace')) }
    'clean'     { Invoke-Docker ($compose + @('down', '--volumes', '--remove-orphans')) }
    'exec' {
        if (-not $Arguments) { throw 'Uso: .\scripts\adl.ps1 exec <comando>' }
        Invoke-Workspace $Arguments
    }
}
