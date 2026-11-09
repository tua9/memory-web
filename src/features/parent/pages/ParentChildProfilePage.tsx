import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { parentApi, type ParentOverview } from '../api/parent.api';
import type { GameCatalogItem } from '@/features/shared-game/api/games.api';
import { Achievements } from '@/features/profile/components/Achievements';
import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { Records } from '@/features/profile/components/Records';
import { buildBadges } from '@/features/profile/utils/badges';
import { ParentGameProgress } from '../components/ParentGameProgress';
import '@/styles/app-screen.css';
import '@/features/profile/profile.css';
import '@/features/shared-game/game.css';

export const ParentChildProfilePage = () => {
    const [overview, setOverview] = useState<ParentOverview | null>(null);
    const [catalog, setCatalog] = useState<GameCatalogItem[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        Promise.all([
            parentApi.overview(),
            parentApi.games(),
        ]).then(([ov, gamesRes]) => {
            if (!active) return;
            setOverview(ov);
            setCatalog(gamesRes.games);
            setLoading(false);
        }).catch((err: { message?: string }) => {
            if (active) {
                setError(err.message ?? 'Không tải được hồ sơ của con.');
                setLoading(false);
            }
        });

        return () => { active = false; };
    }, []);

    const badges = overview?.child?.profile && catalog
        ? buildBadges(overview.child.profile, catalog)
        : null;

    const childName = overview?.child?.username ?? 'Con';

    return (
        <div className="min-h-svh">
            <Header />

            <main className="dash profile page-col">
                <div className="mb-4 flex items-center justify-between">
                    <Link
                        to="/parent"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-deep hover:underline"
                    >
                        <ArrowLeft size={16} aria-hidden="true" />
                        Quay lại Tổng quan tiến độ con
                    </Link>

                    <span className="flex items-center gap-1.5 rounded-full bg-[#EAF8EF] px-3 py-1 text-xs font-semibold text-[#1F6B2A]">
                        <Sparkles size={14} /> Chế độ xem phụ huynh
                    </span>
                </div>

                {loading && <p className="dash-note">Đang tải hồ sơ của {childName}...</p>}
                {error && <p role="alert" className="dash-note dash-note--error">{error}</p>}

                {overview && catalog && (
                    <div className="dash__grid">
                        {/* Đầu trang: ProfileHeader của con */}
                        <section className="panel span-12 profile__head" aria-label={`Hồ sơ của ${childName}`}>
                            <ProfileHeader
                                profile={overview.child.profile}
                                games={catalog}
                                badges={badges && { earned: badges.filter((b) => b.current >= b.target).length, total: badges.length }}
                            />
                        </section>

                        {/* Huy hiệu của con */}
                        <section className="panel profile__badges" aria-labelledby="child-badges-title">
                            <div className="panel__head">
                                <h2 id="child-badges-title">Bộ sưu tập huy hiệu</h2>
                            </div>
                            {badges && <Achievements badges={badges} />}
                        </section>

                        {/* Kỷ lục cá nhân */}
                        <section className="panel profile__records" aria-labelledby="child-records-title">
                            <div className="panel__head">
                                <h2 id="child-records-title">Kỷ lục cá nhân</h2>
                            </div>
                            <Records profile={overview.child.profile} games={catalog} />
                        </section>

                        {/* Chi tiết tiến độ từng trò */}
                        <section className="panel span-12" aria-labelledby="child-games-title">
                            <div className="panel__head">
                                <h2 id="child-games-title">Tiến độ 5 phương pháp rèn luyện</h2>
                                <span className="text-xs text-muted">10 cấp độ thử thách mỗi trò</span>
                            </div>
                            <ParentGameProgress catalog={catalog} progress={overview.progress} />
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ParentChildProfilePage;

