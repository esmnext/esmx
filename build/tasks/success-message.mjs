import { config } from '../config.mjs';
import { colors, toDisplayPath } from '../utils.mjs';

export function displaySuccessMessage() {
    console.log('');
    console.log('');
    console.log(`${colors.green}${colors.bold}`);
    console.log(
        '████████████████████████████████████████████████████████████████████████████'
    );
    console.log(
        '█                                                                          █'
    );
    console.log(
        '█   ███████╗ ███████╗███╗   ███╗██╗  ██╗                                   █'
    );
    console.log(
        '█   ██╔════╝ ██╔════╝████╗ ████║╚██╗██╔╝                                   █'
    );
    console.log(
        '█   █████╗   ███████╗██╔████╔██║ ╚███╔╝                                    █'
    );
    console.log(
        '█   ██╔══╝   ╚════██║██║╚██╔╝██║ ██╔██╗                                    █'
    );
    console.log(
        '█   ███████╗ ███████║██║ ╚═╝ ██║██╔╝ ██╗                                   █'
    );
    console.log(
        '█   ╚══════╝ ╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝                                   █'
    );
    console.log(
        '█                                                                          █'
    );
    console.log(
        `█${colors.magenta}    ██████╗ ██╗   ██╗██╗██╗     ██████╗                                   ${colors.green}█`
    );
    console.log(
        `█${colors.magenta}    ██╔══██╗██║   ██║██║██║     ██╔══██╗                                  ${colors.green}█`
    );
    console.log(
        `█${colors.magenta}    ██████╔╝██║   ██║██║██║     ██║  ██║                                  ${colors.green}█`
    );
    console.log(
        `█${colors.magenta}    ██╔══██╗██║   ██║██║██║     ██║  ██║                                  ${colors.green}█`
    );
    console.log(
        `█${colors.magenta}    ██████╔╝╚██████╔╝██║███████╗██████╔╝                                  ${colors.green}█`
    );
    console.log(
        `█${colors.magenta}    ╚═════╝  ╚═════╝ ╚═╝╚══════╝╚═════╝                                   ${colors.green}█`
    );
    console.log(
        '█                                                                          █'
    );
    console.log(
        `█${colors.cyan}    ███████╗██╗   ██╗ ██████╗ ██████╗███████╗███████╗███████╗             ${colors.green}█`
    );
    console.log(
        `█${colors.cyan}    ██╔════╝██║   ██║██╔════╝██╔════╝██╔════╝██╔════╝██╔════╝             ${colors.green}█`
    );
    console.log(
        `█${colors.cyan}    ███████╗██║   ██║██║     ██║     █████╗  ███████╗███████╗             ${colors.green}█`
    );
    console.log(
        `█${colors.cyan}    ╚════██║██║   ██║██║     ██║     ██╔══╝  ╚════██║╚════██║             ${colors.green}█`
    );
    console.log(
        `█${colors.cyan}    ███████║╚██████╔╝╚██████╗╚██████╗███████╗███████║███████║             ${colors.green}█`
    );
    console.log(
        `█${colors.cyan}    ╚══════╝ ╚═════╝  ╚═════╝ ╚═════╝╚══════╝╚══════╝╚══════╝             ${colors.green}█`
    );
    console.log(
        '█                                                                          █'
    );
    console.log(
        `█${colors.yellow}                      💥 MISSION ACCOMPLISHED! 💥                         ${colors.green}█`
    );
    console.log(
        '█                                                                          █'
    );
    console.log(
        '█   🏆 ALL SYSTEMS OPERATIONAL                                             █'
    );
    console.log(
        '█   ⚡ PACKAGES: BUILT & OPTIMIZED                                         █'
    );
    console.log(
        '█   🧪 TESTS: PASSED WITH COVERAGE REPORTS                                 █'
    );
    console.log(
        '█   🌟 EXAMPLES: DEPLOYMENT READY                                          █'
    );
    console.log(
        `█   🎯 ARTIFACTS: COPIED TO ${toDisplayPath(config.outDir)}                                           █`
    );
    console.log(
        `█   📊 COVERAGE: REPORTS AT https://www.esmnext.com/coverage/              █`
    );
    console.log(
        '█   🔥 STATUS: READY TO DOMINATE THE ESM UNIVERSE!                         █'
    );
    console.log(
        '█                                                                          █'
    );
    console.log(
        '████████████████████████████████████████████████████████████████████████████'
    );
    console.log(`${colors.reset}`);
    console.log('');
    console.log('');
}
