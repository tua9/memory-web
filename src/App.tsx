import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/app/router';
import { useAuthStore } from '@/features/auth/store/authStore';

function App() {
    useEffect(() => {
        useAuthStore.getState().hydrate();
    }, []);

    return <RouterProvider router={router} />;
}

export default App;
