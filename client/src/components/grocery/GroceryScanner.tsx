import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, addDays } from "date-fns";

// Demo grocery data
const GROCERY_ALTERNATIVES = {
  "Tide Detergent": { name: "Kirkland Signature Detergent", price: 8.99, originalPrice: 15.99, savings: 7 },
  "Cheerios": { name: "Great Value Os Cereal", price: 2.49, originalPrice: 4.99, savings: 2.5 },
  "Bounty Paper Towels": { name: "Kirkland Paper Towels", price: 14.99, originalPrice: 21.99, savings: 7 },
  "Heinz Ketchup": { name: "Great Value Ketchup", price: 1.99, originalPrice: 3.49, savings: 1.5 },
  "Nutella": { name: "Great Value Hazelnut Spread", price: 2.99, originalPrice: 4.99, savings: 2 },
};

// Demo inventory prediction data
const INVENTORY_PREDICTIONS = [
  { 
    item: "Eggs", 
    lastPurchase: "2025-03-10", 
    purchaseFrequency: 14, 
    daysRemaining: 2,
    urgency: "high"
  },
  { 
    item: "Milk", 
    lastPurchase: "2025-03-15", 
    purchaseFrequency: 7, 
    daysRemaining: 1,
    urgency: "high"
  },
  { 
    item: "Bread", 
    lastPurchase: "2025-03-18", 
    purchaseFrequency: 5, 
    daysRemaining: 3,
    urgency: "medium"
  },
  { 
    item: "Bananas", 
    lastPurchase: "2025-03-18", 
    purchaseFrequency: 7, 
    daysRemaining: 4,
    urgency: "medium"
  },
  { 
    item: "Coffee", 
    lastPurchase: "2025-03-01", 
    purchaseFrequency: 30, 
    daysRemaining: 8,
    urgency: "low"
  },
];

export default function GroceryScanner() {
  const [searchTerm, setSearchTerm] = useState("");
  const [scannedProduct, setScannedProduct] = useState<string | null>(null);
  const [shoppingList, setShoppingList] = useState<string[]>([]);
  
  // "Scan" a product by searching for it
  const handleSearch = () => {
    if (searchTerm.trim() === "") return;
    
    // Simulate finding a match in our demo data
    const normalizedSearch = searchTerm.toLowerCase();
    const product = Object.keys(GROCERY_ALTERNATIVES).find(
      key => key.toLowerCase().includes(normalizedSearch)
    );
    
    if (product) {
      setScannedProduct(product);
    } else {
      setScannedProduct("No alternatives found");
    }
    
    // Clear search
    setSearchTerm("");
  };
  
  const handleAddToList = (item: string) => {
    if (!shoppingList.includes(item)) {
      setShoppingList([...shoppingList, item]);
    }
  };
  
  const handleRemoveFromList = (item: string) => {
    setShoppingList(shoppingList.filter(i => i !== item));
  };
  
  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "high":
        return <Badge variant="outline" className="bg-red-50 text-red-500 border-red-200">Running Out</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-amber-50 text-amber-500 border-amber-200">Low Stock</Badge>;
      default:
        return <Badge variant="outline" className="bg-blue-50 text-blue-500 border-blue-200">Plan Ahead</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d');
  };
  
  const getPredictedPurchaseDate = (lastPurchase: string, frequency: number) => {
    const date = new Date(lastPurchase);
    return format(addDays(date, frequency), 'MMM d');
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <span className="material-icons text-primary-500 mr-2">photo_camera</span>
            Smart Grocery Scanner
          </CardTitle>
          <CardDescription>
            Scan products to find cheaper alternatives and save money
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="scanner">
            <TabsList className="mb-4">
              <TabsTrigger value="scanner">Product Scanner</TabsTrigger>
              <TabsTrigger value="predictions">Smart Restocking</TabsTrigger>
              <TabsTrigger value="list">Shopping List ({shoppingList.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="scanner" className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Search for a product (try 'Tide', 'Cheerios', etc.)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSearch}>
                  <span className="material-icons mr-1">search</span>
                  Scan
                </Button>
              </div>
              
              {scannedProduct && scannedProduct !== "No alternatives found" && (
                <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-neutral-900">{scannedProduct}</h3>
                      <p className="text-sm text-neutral-500">Premium Brand</p>
                      <p className="text-sm font-semibold mt-1">${GROCERY_ALTERNATIVES[scannedProduct as keyof typeof GROCERY_ALTERNATIVES].originalPrice.toFixed(2)}</p>
                    </div>
                    <div className="w-16 h-16 bg-neutral-100 rounded flex items-center justify-center">
                      <span className="material-icons text-neutral-400">shopping_bag</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-dashed border-neutral-200">
                    <div className="flex items-center">
                      <span className="material-icons text-success-500 mr-2">trending_down</span>
                      <h3 className="font-medium text-success-600">Suggested Alternative</h3>
                    </div>
                    
                    <div className="mt-2 flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-neutral-900">{GROCERY_ALTERNATIVES[scannedProduct as keyof typeof GROCERY_ALTERNATIVES].name}</h3>
                        <p className="text-sm text-neutral-500">Store Brand</p>
                        <p className="text-sm font-semibold mt-1 text-success-600">${GROCERY_ALTERNATIVES[scannedProduct as keyof typeof GROCERY_ALTERNATIVES].price.toFixed(2)}</p>
                      </div>
                      <div className="bg-success-50 px-3 py-2 rounded-full">
                        <p className="text-success-600 font-semibold text-sm">Save ${GROCERY_ALTERNATIVES[scannedProduct as keyof typeof GROCERY_ALTERNATIVES].savings.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <Button onClick={() => handleAddToList(GROCERY_ALTERNATIVES[scannedProduct as keyof typeof GROCERY_ALTERNATIVES].name)} className="w-full mt-3">
                      Add to Shopping List
                    </Button>
                  </div>
                </div>
              )}
              
              {scannedProduct === "No alternatives found" && (
                <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
                  <div className="flex items-center justify-center flex-col py-6">
                    <span className="material-icons text-neutral-300 text-5xl mb-2">search_off</span>
                    <h3 className="font-medium text-neutral-700">No alternatives found</h3>
                    <p className="text-sm text-neutral-500">Try searching for another product</p>
                  </div>
                </div>
              )}
              
              <div className="bg-primary-50 p-4 rounded-lg border border-primary-100">
                <div className="flex items-start">
                  <span className="material-icons text-primary-500 mr-2">tips_and_updates</span>
                  <div>
                    <h3 className="text-sm font-medium text-primary-800">Shopping Tip</h3>
                    <p className="text-xs text-primary-700">Store brands often have the same quality as name brands but cost 20-40% less. Many are made in the same factories as premium brands!</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="predictions" className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-neutral-200">
                <h3 className="font-medium text-neutral-900 mb-4">Smart Restocking Suggestions</h3>
                
                <div className="space-y-4">
                  {INVENTORY_PREDICTIONS.map((item) => (
                    <div key={item.item} className="flex justify-between items-center border-b border-neutral-100 pb-3 last:border-0 last:pb-0">
                      <div>
                        <div className="flex items-center">
                          <h4 className="font-medium text-neutral-800">{item.item}</h4>
                          <div className="ml-2">
                            {getUrgencyBadge(item.urgency)}
                          </div>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">
                          Last bought: {formatDate(item.lastPurchase)} • Usually lasts {item.purchaseFrequency} days
                        </p>
                      </div>
                      <div className="flex items-center">
                        <div className="mr-3 text-right">
                          <p className="text-xs text-neutral-500">Running out in:</p>
                          <p className="text-sm font-semibold text-neutral-800">{item.daysRemaining} days</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-8"
                          onClick={() => handleAddToList(item.item)}
                        >
                          <span className="material-icons text-sm mr-1">add</span>
                          Add
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-primary-50 p-4 rounded-lg border border-primary-100">
                <div className="flex items-start">
                  <span className="material-icons text-primary-500 mr-2">lightbulb</span>
                  <div>
                    <h3 className="text-sm font-medium text-primary-800">How This Works</h3>
                    <p className="text-xs text-primary-700">These suggestions are based on your previous shopping patterns. We analyze when you typically purchase items and predict when you might run out.</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="list">
              <div className="bg-white rounded-lg border border-neutral-200">
                {shoppingList.length > 0 ? (
                  <div>
                    <ul className="divide-y divide-neutral-100">
                      {shoppingList.map((item, index) => (
                        <li key={index} className="flex justify-between items-center p-3">
                          <span>{item}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRemoveFromList(item)}
                            className="h-8 w-8 p-0"
                          >
                            <span className="material-icons text-neutral-500">close</span>
                          </Button>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="p-4 border-t border-neutral-100">
                      <Button className="w-full">
                        <span className="material-icons mr-1">shopping_cart</span>
                        Prepare for Shopping
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8">
                    <span className="material-icons text-neutral-300 text-5xl mb-2">shopping_cart</span>
                    <h3 className="font-medium text-neutral-700">Your shopping list is empty</h3>
                    <p className="text-sm text-neutral-500 mt-1">Scan products or add items from the suggestions</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="border-t border-neutral-100 pt-4">
          <div className="text-xs text-neutral-500">
            Note: In a real implementation, you would be able to scan barcodes or take photos of products using your device's camera. This demo uses text search for demonstration purposes.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}