export type MenuItem = {
    id: string;
    label: string;
    icon: React.ReactNode;
}

export type MenuI = {
    menusSelected: MenuItem[] | [],
    setMenuSelected: (item: MenuItem[]|[]) => void
}