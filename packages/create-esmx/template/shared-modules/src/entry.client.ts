import { version } from './vue/index';
import { version as vue2Version } from './vue2/index';

const versions = [
    { name: 'vue3', clientVersion: version },
    { name: 'vue2', clientVersion: vue2Version }
];

function checkVersionConsistency() {
    versions.forEach(({ name, clientVersion }) => {
        const serverVersion = document.getElementById(
            `${name}-server-version`
        )?.textContent;
        const status = document.getElementById(`${name}-status`);
        const card = document.getElementById(`${name}-card`);

        document.getElementById(`${name}-client-version`)!.textContent =
            clientVersion;

        if (!status || !card) return;

        const isConsistent = clientVersion === serverVersion;
        status.className = `status-indicator status-${isConsistent ? 'consistent' : 'inconsistent'}`;
        status.innerHTML = `<span class="icon ${isConsistent ? 'success' : 'error'}">${isConsistent ? '✓' : '✗'}</span><span>Module versions ${isConsistent ? 'consistent' : 'inconsistent'}</span>`;

        if (isConsistent) {
            card.classList.add('consistency-animation');
            setTimeout(
                () => card.classList.remove('consistency-animation'),
                2000
            );
        }
    });
}

checkVersionConsistency();
