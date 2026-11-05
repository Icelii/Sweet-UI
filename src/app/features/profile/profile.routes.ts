import { Routes } from "@angular/router";
import { ProfileConfigLayout } from "@layouts/profile-config-layout/profile-config-layout";

export const PROFILE_ROUTES: Routes = [
    {
        path: '',
        component: ProfileConfigLayout,
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'profile' },
            {
                path: 'profile',
                title: 'title.account-settings',
                loadComponent: () => import('@features/profile/pages/profile/profile').then((c) => c.Profile)
            }
        ]
    }
];