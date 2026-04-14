import { useState, useCallback } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import Sidebar from "./components/Sidebar";
import HierarchyFlow from "./components/HierarchyFlow";
import "./App.css";

export default function App() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleProductChange = useCallback((key) => {
    setSelectedProduct(key);
    setSearchTerm("");
  }, []);

  const handleNodeSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  return (
    <div className="app">
      <Sidebar
        selectedProduct={selectedProduct}
        onProductChange={handleProductChange}
        onNodeSearch={handleNodeSearch}
      />
      <main className="main-area">
        <ReactFlowProvider>
          <HierarchyFlow productKey={selectedProduct} searchTerm={searchTerm} />
        </ReactFlowProvider>
      </main>
    </div>
  );
}
