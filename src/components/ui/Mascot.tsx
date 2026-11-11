// Linh vật Memio: chuyển động nằm sẵn trong file SVG (public/), nên chỉ cần <img>
export const Mascot = ({ className = "", celebrating = false }: { className?: string; celebrating?: boolean }) => (
    <img
        className={`mascot ${className}`}
        src={celebrating ? "/profile-mascot-celebrating.svg" : "/profile-mascot.svg"}
        alt=""
        aria-hidden="true"
        draggable={false}
    />
);
