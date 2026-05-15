<script lang="ts">
    import type { Layout } from 'ssr-micro-shared/src/index';

    interface Props {
        layout: Layout;
    }

    let { layout }: Props = $props();

    let r = $state(255);
    let g = $state(62);
    let b = $state(0);
    let color = $derived(`rgb(${r},${g},${b})`);
</script>

<div>
    {@html `<div id="${layout.headerId}">${layout.header}</div>`}
    <div
        style="margin-left: var(--esmx-sidebar-width, 260px); min-height: 100vh; padding: 32px; padding-top: calc(32px + var(--esmx-mobile-header-height, 0px));"
    >
        <div style="max-width: 800px; margin: 0 auto;">
            <div
                style="background: var(--esmx-bg-card); border-radius: 16px; padding: 48px; border: 1px solid var(--esmx-border); text-align: center;"
            >
                <div
                    style="width: 56px; height: 56px; background: linear-gradient(135deg, #ff3e00, #bf2e00); border-radius: 14px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;"
                    role="img"
                    aria-label="Svelte"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 32 32"
                        width="28"
                        height="28"
                    >
                        <path
                            d="M15.9 1.8C8.3 1.8 2.1 8 2.1 15.6c0 0 .3-.3.8-.7 2.6-2 7.8-7.8 9.4-7.8 1.4 0 2 4.3 4.2 10.7.8 2.4 1.7 5.1 2.6 7.2 1.7 3.9 3.6 6.6 5.6 6.6 3.6 0 5.2-3 5.2-5.6 0-2.3-1.3-4.1-2.5-3.9-.7.1-1.2.8-1.2 1.6 0 .6.4 1.2 1 1.5.4.2.8.4 1.2.6-.7 1.4-1.9 2.1-3 1.9-1.8-.3-3.1-3.1-4.4-6C18.4 14.5 15.6 1.8 15.9 1.8z"
                            fill="#fff"
                        />
                    </svg>
                </div>
                <div
                    style="width:120px;height:120px;border-radius:16px;margin:12px auto;background:{color};box-shadow:0 4px 20px {color}66;"
                />
                <div style="max-width:300px;margin:0 auto;">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                        <span style="color:#ef4444;width:16px;font-weight:700;">R</span>
                        <input type="range" min="0" max="255" bind:value={r} style="flex:1;" />
                        <span style="font-family:monospace;width:32px;color:var(--esmx-text-primary);">{r}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                        <span style="color:#10b981;width:16px;font-weight:700;">G</span>
                        <input type="range" min="0" max="255" bind:value={g} style="flex:1;" />
                        <span style="font-family:monospace;width:32px;color:var(--esmx-text-primary);">{g}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:8px;">
                        <span style="color:#3b82f6;width:16px;font-weight:700;">B</span>
                        <input type="range" min="0" max="255" bind:value={b} style="flex:1;" />
                        <span style="font-family:monospace;width:32px;color:var(--esmx-text-primary);">{b}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    {@html `<div id="${layout.footerId}">${layout.footer}</div>`}
</div>
