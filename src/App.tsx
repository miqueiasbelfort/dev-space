import { useState } from 'react';
import './App.css';
import type { MenuItem } from "./ts/menu";
import Menu from './components/Menu';
import Card from './components/Card/Index';
import DailyNotes from './components/DailyNotes/Index';
import Todo from './components/Todo/Index';
import HttpClient from './components/HttpClient/Index';
import Passwords from './components/Passwords/Index';
import Welcome from './components/Welcome/Index';
import Data from './components/Data/Index';

function App() {
  const [selectedItems, setSelectedItems] = useState<MenuItem[]>([]);
  return (
    <div className="app-container">
      <Welcome 
        hasSelectd={selectedItems.length > 0}
      />
      {selectedItems.map((item: MenuItem) => (
          <Card key={item.id}>{renderTypeCard(item)}</Card>
        ))}
      <Menu
        setMenuSelected={setSelectedItems}
        menusSelected={selectedItems}
      />
    </div>
  );
}

const renderTypeCard = (item: MenuItem) => {
  switch (item.id) {
    case 'dailyNotes':
        return <DailyNotes/>
    case 'todo':
        return <Todo/>
    case 'requester':
        return <HttpClient/>
    case 'password':
        return <Passwords/>
    case 'data':
        return <Data/>
    default:
        return <h1>Card Not Found</h1>
  }
}

export default App
