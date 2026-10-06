import { CardsGame } from "@/features/cards-game/components/CardsGame";
import { Header } from "@/components/layout/Header";

function App() {
    return (
        <div className="flex min-h-screen flex-col bg-[#f5faf7]">
            <Header />
            <CardsGame />
        </div>
    );
}

export default App;
