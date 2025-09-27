"use client";
import { useEffect, useState } from "react";
import axios from "axios";

interface Menu {
  _id: string;
  name: string;
  parentId?: string | null;
  children?: Menu[];
}

const MenuItem = ({ menu }: { menu: Menu }) => {
  return (
    <li className="ml-4">
      <span className="font-semibold text-blue-600">{menu.name}</span>
      {menu.children && menu.children.length > 0 && (
        <ul className="ml-6 list-disc">
          {menu.children.map((child) => (
            <MenuItem key={child._id} menu={child} />
          ))}
        </ul>
      )}
    </li>
  );
};

export default function MenuTree() {
  const [menus, setMenus] = useState<Menu[]>([]);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/menus") // backend ka URL
      .then((res) => setMenus(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Dynamic Menu Tree</h1>
      <ul className="list-disc">
        {menus.map((menu) => (
          <MenuItem key={menu._id} menu={menu} />
        ))}
      </ul>
    </div>
  );
}
