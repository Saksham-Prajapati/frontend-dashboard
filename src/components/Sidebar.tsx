"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Home, ChevronDown, ChevronRight } from "lucide-react";
import { TreeNodeData } from "./TreeMenu";

export default function Sidebar() {
    const [open, setOpen] = useState(true);
    const [treeData, setTreeData] = useState<TreeNodeData[]>([]);
    const [expandedIds, setExpandedIds] = useState<string[]>([]); // ✅ Track expanded parents

    // ✅ Fetch data from API
    useEffect(() => {
        const fetchTreeData = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/menus");
                const data = await res.json();
                setTreeData(data);
            } catch (error) {
                console.error("Error fetching tree data:", error);
            }
        };
        fetchTreeData();
    }, []);

    // ✅ Toggle expand/collapse
    const toggleExpand = (id: string) => {
        setExpandedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const renderTree = (nodes: TreeNodeData[], level = 0) => {
        return nodes.map((node) => {
            const hasChildren = node.children && node.children.length > 0;
            const isExpanded = expandedIds.includes(node.id == undefined ? "" : node.id);

            return (
                <div key={node.id} style={{ paddingLeft: level * 16 }}>
                    {hasChildren ? (
                        <button
                            onClick={() => toggleExpand(node.id == undefined ? "" : node.id)}
                            className="flex w-full items-center gap-3 p-3 hover:bg-gray-700 text-left"
                        >
                            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                            {open && node.name}
                        </button>
                    ) : (
                        <Link
                            href={node.url || "#"}
                            className="flex items-center gap-3 p-3 hover:bg-gray-700"
                        >
                            <Home size={20} /> {open && node.name}
                        </Link>
                    )}

                    {/* Render children only when expanded */}
                    {hasChildren && isExpanded && (
                        <div>{renderTree(node.children!, level + 1)}</div>
                    )}
                </div>
            );
        });
    };

    return (
        <div
            className={`h-screen bg-gray-900 text-white ${open ? "w-64" : "w-20"
                } transition-all duration-300`}
        >
            <div className="flex items-center justify-between p-4">
                <h1 className={`text-xl font-bold ${!open && "hidden"}`}>Dashboard</h1>
                <button onClick={() => setOpen(!open)}>
                    <Menu />
                </button>
            </div>

            <nav className="mt-6">
                <Link
                    href="/"
                    className="flex items-center gap-3 p-3 hover:bg-gray-700"
                >
                    <Home size={20} /> {open && "Home"}
                </Link>

                {renderTree(treeData)}
            </nav>
        </div>
    );
}
