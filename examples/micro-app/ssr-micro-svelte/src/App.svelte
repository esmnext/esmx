<script lang="ts">
    import type { Layout } from 'ssr-micro-shared/src/index';

    interface Props {
        layout: Layout;
    }

    let { layout }: Props = $props();

    let count = $state(0);
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
                <h1
                    style="font-size: 2rem; font-weight: 800; color: var(--esmx-text-primary); margin-bottom: 12px;"
                >
                    Svelte 5 Micro-App
                </h1>
                <div style="margin:16px 0;">
                    <div style="font-size:3rem;font-weight:800;color:var(--esmx-text-primary);margin-bottom:12px;">{count}</div>
                    <div style="display:flex;gap:12px;justify-content:center;">
                        <button onclick={() => count++} style="padding:8px 24px;border-radius:8px;border:none;background:var(--esmx-link);color:#fff;cursor:pointer;font-size:1.2rem;">+</button>
                        <button onclick={() => count--} style="padding:8px 24px;border-radius:8px;border:none;background:#ef4444;color:#fff;cursor:pointer;font-size:1.2rem;">-</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    {@html `<div id="${layout.footerId}">${layout.footer}</div>`}
</div>
