"use client";

import React, { useState, useEffect } from "react";
import styles from "./TreeMenu.module.css";

export interface TreeNodeData {
    id?: string;
    name: string;
    parentId: string;
    url?: string;
    children?: TreeNodeData[];
}

const TreeNode: React.FC<{
    node: TreeNodeData;
    onAdd: (parentId: string) => void;
    onEdit: (node: TreeNodeData) => void;
}> = ({ node, onAdd, onEdit }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleToggleExpand = () => setIsExpanded(!isExpanded);

    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className={styles.treeNode}>
            <div className={styles.treeNodeContent}>
                {hasChildren && (
                    <button className={styles.expandButton} onClick={handleToggleExpand}>
                        {isExpanded ? "-" : "+"}
                    </button>
                )}
                <span className={styles.nodeName}>
                    {node.name} <small className={styles.nodeUrl}>({node.url})</small>
                </span>

                <button className={styles.addButton} onClick={() => onAdd(node.id == undefined ? "" : node.id)}>
                    Add Child
                </button>
                <button className={styles.editButton} onClick={() => onEdit(node)}>
                    Edit
                </button>
            </div>

            {isExpanded && hasChildren && (
                <div className={styles.treeChildren}>
                    {node.children!.map((child) => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            onAdd={onAdd}
                            onEdit={onEdit}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// ✅ Modal Component
const Modal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, url: string) => void;
    initialName?: string;
    initialUrl?: string;
    title: string;
}> = ({ isOpen, onClose, onSave, initialName = "", initialUrl = "", title }) => {
    const [name, setName] = useState(initialName);
    const [url, setUrl] = useState(initialUrl);

    useEffect(() => {
        setName(initialName);
        setUrl(initialUrl);
    }, [initialName, initialUrl]);

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <h3>{title}</h3>
                <input
                    type="text"
                    placeholder="Menu Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Menu URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />
                <div className={styles.modalActions}>
                    <button
                        className={styles.saveButton}
                        onClick={() => {
                            onSave(name, url);
                            onClose();
                        }}
                    >
                        Save
                    </button>
                    <button className={styles.cancelButton} onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

const TreeMenu: React.FC = () => {
    const [treeData, setTreeData] = useState<TreeNodeData[]>([]);
    const [loading, setLoading] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalInitialName, setModalInitialName] = useState("");
    const [modalInitialUrl, setModalInitialUrl] = useState("");
    const [modalSaveAction, setModalSaveAction] = useState<
        ((name: string, url: string) => void) | null
    >(null);

    // ✅ Fetch data from API
    useEffect(() => {
        const fetchTreeData = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/menus");
                const data = await res.json();
                setTreeData(data);
            } catch (error) {
                console.error("Error fetching tree data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTreeData();
    }, []);

    const findAndUpdateNode = (
        nodes: TreeNodeData[],
        targetId: string,
        action: (node: TreeNodeData) => TreeNodeData
    ): TreeNodeData[] => {
        return nodes.map((node) => {
            if (node.id === targetId) return action(node);
            if (node.children) {
                return {
                    ...node,
                    children: findAndUpdateNode(node.children, targetId, action),
                };
            }
            return node;
        });
    };

    // ✅ Add menu
    const handleAdd = (parentId: string) => {
        setModalTitle("Add Menu");
        setModalInitialName("");
        setModalInitialUrl("");
        setModalSaveAction(() => (name: string, url: string) => {
            const newNode: TreeNodeData = {
                name,
                parentId,
                url,
                children: [],
            };
            setTreeData((prevData) =>
                findAndUpdateNode(prevData, parentId, (node) => ({
                    ...node,
                    children: [...(node.children || []), newNode],
                }))
            );
            // ✅ Optional: call API
            fetch("http://localhost:8000/api/menus", {
                method: "POST", body: JSON.stringify(newNode), headers: {
                    "Content-Type": "application/json",
                    // "Authorization": `Bearer ${token}`, // add if your API needs auth
                }
            })
        });
        setModalOpen(true);
    };

    // ✅ Edit menu
    const handleEdit = (node: TreeNodeData) => {
        setModalTitle("Edit Menu");
        setModalInitialName(node.name);
        setModalInitialUrl(node.url || "");
        setModalSaveAction(() => (name: string, url: string) => {
            setTreeData((prevData) =>
                findAndUpdateNode(prevData, node.parentId, (node) => ({
                    ...node,
                    children: [...(node.children || []), node],
                }))
            );
            // ✅ Optional: call API
            fetch(`http://localhost:8000/api/menus/${node.id}`, {
                method: "PUT", body: JSON.stringify(node), headers: {
                    "Content-Type": "application/json",
                    // "Authorization": `Bearer ${token}`, // add if your API needs auth
                }
            })
        });
        setModalOpen(true);
    };

    if (loading) return <p>Loading menu...</p>;

    return (
        <div className={styles.treeMenu}>
            <h2>Tree Style Menu</h2>
            <button className={styles.addRootButton} onClick={() => handleAdd("null")}>
                Add Root Menu
            </button>
            {treeData.map((node) => (
                <TreeNode key={node.id} node={node} onAdd={handleAdd} onEdit={handleEdit} />
            ))}

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={(name, url) => modalSaveAction?.(name, url)}
                initialName={modalInitialName}
                initialUrl={modalInitialUrl}
                title={modalTitle}
            />
        </div>
    );
};

export default TreeMenu;
