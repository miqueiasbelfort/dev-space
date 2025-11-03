import type { MenuItem, MenuI } from "../ts/menu";
import { BsPersonVideo2 } from "react-icons/bs";
import { FaListUl } from "react-icons/fa6";
import { FaDatabase } from "react-icons/fa";
import { PiShareNetworkFill } from "react-icons/pi";
import { MdSecurity } from "react-icons/md";


const menuItems: MenuItem[] = [
    {
        id: 'dailyNotes',
        label: 'Daily Notes',
        icon: ( <BsPersonVideo2 size={25}/> ),
    },
    {
        id: 'todo',
        label: 'Todo List',
        icon: (<FaListUl size={25}/>),
    },
    {
        id: 'requester',
        label: 'HTTP Client',
        icon: (<PiShareNetworkFill size={25}/>),
    },
    {
        id: 'password',
        label: 'Passwords',
        icon: (<MdSecurity size={25}/>),
    },
    {
        id: 'data',
        label: 'Data',
        icon: (<FaDatabase size={22}/>),
    }
];

const Menu = ({menusSelected, setMenuSelected}: MenuI) => {

    const addMenu = (menu: MenuItem) => {
        const isEqual = menusSelected.find(item => item.id === menu.id);
        if(isEqual){
            setMenuSelected(menusSelected.filter(item => item.id !== menu.id));
            return;
        }
        setMenuSelected([...menusSelected, menu]);
    }

    return (
        <nav className="bottom-menu">
            {menuItems.map((item) => (
                <button
                    key={item.id}
                    className={`menu-item ${menusSelected.some(selected => selected.id === item.id) ? 'active' : ''}`}
                    onClick={() => addMenu(item)}
                    aria-label={item.label}
                >
                    <span className="icon">{item.icon}</span>
                    <span className="label">{item.label}</span>
                </button>
            ))}
        </nav>
    );
}

export default Menu;