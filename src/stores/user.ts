import { defineStore } from 'pinia';
import { spfi } from '@pnp/sp';
import { getSP } from '../pnpjsConfig';
import "@pnp/sp/webs";
import "@pnp/sp/site-users/web";
import "@pnp/sp/site-groups/web";
import { FeatureKey } from '../config/keystrs';
import { IUser } from '../model/user';

export const useUserStore = defineStore(FeatureKey.USER, {
    state: () => ({
        user: undefined as IUser,
        groups: [] as string[],
        businesscontrolers: [] as IUser[],
        hanyutype1s: [] as IUser[],
        inventorymanagers: [] as IUser[]
    }),
    getters: {
        userInfo: (state) => state.user,
        groupInfo: (state) => state.groups
    },
    actions: {
        async getUser(Id?: number): Promise<void> {
            try {
                const sp = spfi(getSP());
                const u = Id ? await sp.web.getUserById(Id)() : await sp.web.currentUser();
                this.user = {
                    Id: u.Id,
                    LoginName: u.LoginName,
                    Title: u.Title,
                    Email: u.Email || "",
                    IsSiteAdmin: u.IsSiteAdmin,
                    UserPrincipalName: u.UserPrincipalName
                } as IUser;
                const gs = Id ? await sp.web.getUserById(Id).groups() : await sp.web.currentUser.groups();
                this.groups = [...gs.map(group => group.Title)];
            }
            catch (error) {
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }

        },
        async getMembersByGroupName(GroupName: 'Business Controler' | 'Hanyu type 1' | 'Inventory Manager'): Promise<void> {
            try {
                const sp = spfi(getSP());
                const group = await sp.web.siteGroups.getByName(GroupName);

                const members = await group.users();

                switch (GroupName) {
                    case 'Business Controler':
                        this.businesscontrolers = members.map(u => ({
                            Id: u.Id,
                            LoginName: u.LoginName,
                            Title: u.Title,
                            Email: u.Email || "",
                            IsSiteAdmin: u.IsSiteAdmin,
                            UserPrincipalName: u.UserPrincipalName
                        } as IUser));
                        break;
                    case 'Hanyu type 1':
                        this.hanyutype1s = members.map(u => ({
                            Id: u.Id,
                            LoginName: u.LoginName,
                            Title: u.Title,
                            Email: u.Email || "",
                            IsSiteAdmin: u.IsSiteAdmin,
                            UserPrincipalName: u.UserPrincipalName
                        } as IUser));
                        break;
                    case 'Inventory Manager':
                        this.inventorymanagers = members.map(u => ({
                            Id: u.Id,
                            LoginName: u.LoginName,
                            Title: u.Title,
                            Email: u.Email || "",
                            IsSiteAdmin: u.IsSiteAdmin,
                            UserPrincipalName: u.UserPrincipalName
                        } as IUser));
                        break;
                    default:
                        break;

                }

            }
            catch (error) {
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }
        }

    },
})