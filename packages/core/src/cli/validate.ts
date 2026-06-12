import { styleText } from 'node:util';
import type { Diagnostic, ResolvedMount, SupplyEntry } from '../declaration';
import { resolveDeclaration } from '../declaration';

export const VALIDATE_HELP = `Usage: esmx validate [--json]

Build-free dry run of the RFC 0001 module protocol: reads the package.json
"esmx" declaration in the current directory and runs the resolution layer
(phases 1-2: consumption graph + supply merge) without building anything.

Exit code is non-zero only when an error-severity diagnostic is found;
warnings alone exit 0. A package without an "esmx" field uses the legacy
entry.node.ts config and is not an error.

Options:
  --json    Emit a machine-readable envelope on stdout and nothing else:
            {
              "diagnostics": [ { "code", "check"?, "module", "package"?,
                                 "found"?, "required"?, "message", "fix" } ],
              "supply":      { "<package>": { "provider", "version" } },
              "mounts":      { "<module>":  { "name", "root",
                                              "artifactDir", "built" } }
            }
            Legacy packages emit { "protocol": "legacy", "diagnostics": [] }.
  --help    Show this message.`;

export interface RunValidateOptions {
    json?: boolean;
}

export interface RunValidateResult {
    exitCode: number;
    /** Full stdout payload (JSON envelope or human report). */
    output: string;
}

interface ValidateEnvelopeEntry {
    code: string;
    check?: string;
    module: string;
    package?: string;
    found?: string;
    required?: string;
    message: string;
    fix: string;
}

function toEnvelopeEntry(diagnostic: Diagnostic): ValidateEnvelopeEntry {
    const entry: ValidateEnvelopeEntry = {
        code: diagnostic.code,
        module: diagnostic.module,
        message: diagnostic.message,
        fix: diagnostic.fix
    };
    if (diagnostic.check !== undefined) {
        entry.check = diagnostic.check;
    }
    if (diagnostic.package !== undefined) {
        entry.package = diagnostic.package;
    }
    if (diagnostic.found !== undefined) {
        entry.found = diagnostic.found;
    }
    if (diagnostic.required !== undefined) {
        entry.required = diagnostic.required;
    }
    return entry;
}

function formatHumanDiagnostic(diagnostic: Diagnostic): string {
    const color = diagnostic.severity === 'error' ? 'red' : 'yellow';
    const location = diagnostic.package
        ? `${diagnostic.module} → ${diagnostic.package}`
        : diagnostic.module;
    const lines = [styleText(color, `[${diagnostic.code}]`) + ` ${location}`];
    if (diagnostic.check) {
        lines.push(`    check: ${diagnostic.check}`);
    }
    if (diagnostic.found !== undefined || diagnostic.required !== undefined) {
        lines.push(
            `    found: ${diagnostic.found ?? '—'} / required: ${diagnostic.required ?? '—'}`
        );
    }
    lines.push(`    ${diagnostic.message}`);
    lines.push(`    fix: ${diagnostic.fix}`);
    return lines.join('\n');
}

function formatHumanReport(
    diagnostics: Diagnostic[],
    supply: Record<string, SupplyEntry>,
    mounts: Record<string, ResolvedMount>
): string {
    const sections: string[] = [];
    const errorCount = diagnostics.filter((d) => d.severity === 'error').length;
    const warningCount = diagnostics.length - errorCount;

    if (diagnostics.length === 0) {
        sections.push(styleText('green', '✓ Declaration is valid.'));
    } else {
        sections.push(diagnostics.map(formatHumanDiagnostic).join('\n'));
        sections.push(`${errorCount} error(s), ${warningCount} warning(s).`);
    }

    const supplyEntries = Object.entries(supply);
    sections.push(
        supplyEntries.length === 0
            ? 'Supply: (empty)'
            : [
                  'Supply:',
                  ...supplyEntries.map(
                      ([pkg, entry]) =>
                          `  ${pkg} → ${entry.provider}@${entry.version ?? 'unresolved'}`
                  )
              ].join('\n')
    );

    const mountEntries = Object.entries(mounts);
    sections.push(
        mountEntries.length === 0
            ? 'Mounts: (empty)'
            : [
                  'Mounts:',
                  ...mountEntries.map(
                      ([name, mount]) =>
                          `  ${name} → ${mount.artifactDir} (${mount.built ? 'built' : 'not built'})`
                  )
              ].join('\n')
    );

    return sections.join('\n\n');
}

/**
 * `esmx validate` core (RFC 0001 §10 Phase 5, the agent verification loop).
 * Pure with respect to process state: never writes to stdout/stderr and
 * never exits — the CLI case owns printing and the exit code.
 */
export async function runValidate(
    rootDir: string,
    options: RunValidateOptions = {}
): Promise<RunValidateResult> {
    const resolved = resolveDeclaration(rootDir);
    if (!resolved) {
        if (options.json) {
            return {
                exitCode: 0,
                output: JSON.stringify(
                    { protocol: 'legacy', diagnostics: [] },
                    null,
                    4
                )
            };
        }
        return {
            exitCode: 0,
            output: [
                'No "esmx" field in package.json — this module uses the legacy entry.node.ts config.',
                'That is fine: the new module protocol is opt-in. To adopt it, run `esmx migrate`.'
            ].join('\n')
        };
    }

    const { diagnostics, supply } = resolved;
    const mounts = resolved.mounts;
    const hasError = diagnostics.some((d) => d.severity === 'error');
    const exitCode = hasError ? 1 : 0;

    if (options.json) {
        return {
            exitCode,
            output: JSON.stringify(
                {
                    diagnostics: diagnostics.map(toEnvelopeEntry),
                    supply,
                    mounts
                },
                null,
                4
            )
        };
    }
    return {
        exitCode,
        output: formatHumanReport(diagnostics, supply, mounts)
    };
}
