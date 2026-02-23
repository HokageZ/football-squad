'use client';

export function BackgroundEffect() {
    return (
        <div 
            className="fixed inset-0 -z-50 pointer-events-none"
            style={{
                background: `
                    radial-gradient(ellipse 80% 50% at 20% 40%, oklch(0.85 0.23 135 / 0.06), transparent),
                    radial-gradient(ellipse 60% 50% at 80% 60%, oklch(0.25 0.1 260 / 0.04), transparent),
                    var(--background)
                `,
                backgroundSize: '100% 100%, 100% 100%, 100% 100%'
            }}
        />
    );
}
