import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Sample grocery items database with alternative suggestions and price comparisons
const groceryDatabase = [
  {
    id: 1,
    name: "Organic Bananas",
    price: 4.99,
    alternatives: [
      { id: 101, name: "Regular Bananas", price: 2.99, savings: 40 },
      { id: 102, name: "Frozen Bananas", price: 3.49, savings: 30 }
    ]
  },
  {
    id: 2,
    name: "Almond Milk",
    price: 5.99,
    alternatives: [
      { id: 201, name: "Store Brand Almond Milk", price: 3.99, savings: 33 },
      { id: 202, name: "Soy Milk", price: 4.49, savings: 25 }
    ]
  },
  {
    id: 3,
    name: "Free Range Eggs",
    price: 6.99,
    alternatives: [
      { id: 301, name: "Regular Eggs", price: 3.99, savings: 43 },
      { id: 302, name: "Store Brand Cage-Free Eggs", price: 5.49, savings: 21 }
    ]
  },
  {
    id: 4,
    name: "Organic Spinach",
    price: 4.99,
    alternatives: [
      { id: 401, name: "Regular Spinach", price: 2.99, savings: 40 },
      { id: 402, name: "Frozen Spinach", price: 1.99, savings: 60 }
    ]
  },
  {
    id: 5,
    name: "Premium Coffee Beans",
    price: 14.99,
    alternatives: [
      { id: 501, name: "Store Brand Coffee", price: 8.99, savings: 40 },
      { id: 502, name: "Coffee Grounds", price: 9.99, savings: 33 }
    ]
  }
];

// Sample purchase history to suggest restock items
const purchaseHistory = [
  { id: 1, name: "Milk", lastPurchase: "2 weeks ago", suggestRestock: true },
  { id: 2, name: "Bread", lastPurchase: "1 week ago", suggestRestock: false },
  { id: 3, name: "Eggs", lastPurchase: "3 weeks ago", suggestRestock: true },
  { id: 4, name: "Coffee", lastPurchase: "1 month ago", suggestRestock: true },
  { id: 5, name: "Flour", lastPurchase: "2 months ago", suggestRestock: false }
];

export default function GroceryScanner() {
  const [searchTerm, setSearchTerm] = useState("");
  const [scannedItems, setScannedItems] = useState<any[]>([]);
  const [selectedAlternatives, setSelectedAlternatives] = useState<any[]>([]);
  const { toast } = useToast();

  const handleSearch = () => {
    if (searchTerm.trim() === "") return;
    
    // Find item in our mock database
    const foundItem = groceryDatabase.find(
      item => item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (foundItem) {
      // Check if already in scanned items
      if (!scannedItems.some(item => item.id === foundItem.id)) {
        setScannedItems([...scannedItems, foundItem]);
        toast({
          title: "Item Added",
          description: `${foundItem.name} has been added to your list.`,
        });
      } else {
        toast({
          title: "Item Already Added",
          description: `${foundItem.name} is already in your list.`,
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Item Not Found",
        description: "Sorry, we couldn't find that grocery item.",
        variant: "destructive"
      });
    }
    
    setSearchTerm("");
  };

  const selectAlternative = (original: any, alternative: any) => {
    setSelectedAlternatives([
      ...selectedAlternatives.filter(item => item.originalId !== original.id), 
      { originalId: original.id, alternative }
    ]);
    
    toast({
      title: "Savings Applied",
      description: `Switched to ${alternative.name} and saved $${(original.price - alternative.price).toFixed(2)}!`,
    });
  };

  const isAlternativeSelected = (originalId: number, alternativeId: number) => {
    const selection = selectedAlternatives.find(item => item.originalId === originalId);
    return selection && selection.alternative.id === alternativeId;
  };
  
  const calculateTotalSavings = () => {
    return selectedAlternatives.reduce((total, item) => {
      const originalItem = groceryDatabase.find(g => g.id === item.originalId);
      if (originalItem) {
        return total + (originalItem.price - item.alternative.price);
      }
      return total;
    }, 0);
  };

  const calculateOriginalTotal = () => {
    return scannedItems.reduce((total, item) => total + item.price, 0);
  };
  
  const calculateFinalTotal = () => {
    return scannedItems.reduce((total, item) => {
      const alternative = selectedAlternatives.find(alt => alt.originalId === item.id);
      if (alternative) {
        return total + alternative.alternative.price;
      }
      return total + item.price;
    }, 0);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Smart Grocery Scanner</CardTitle>
          <CardDescription>
            Find better deals on your grocery shopping and track when it's time to restock
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex space-x-2">
            <Input
              className="flex-1"
              placeholder="Search for grocery items (try 'Organic Bananas', 'Almond Milk')"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
            />
            <Button onClick={handleSearch}>Add Item</Button>
          </div>
          
          {/* Shopping List */}
          {scannedItems.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Shopping List ({scannedItems.length} items)</h3>
              
              {scannedItems.map((item) => {
                const isAltSelected = selectedAlternatives.some(alt => alt.originalId === item.id);
                const selectedAlt = selectedAlternatives.find(alt => alt.originalId === item.id)?.alternative;
                
                return (
                  <Card key={item.id} className="p-4 border border-neutral-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        {isAltSelected ? (
                          <div className="text-sm line-through text-neutral-500">
                            ${item.price.toFixed(2)}
                          </div>
                        ) : (
                          <div className="text-sm font-semibold">
                            ${item.price.toFixed(2)}
                          </div>
                        )}
                        
                        {isAltSelected && (
                          <div className="flex items-center mt-1">
                            <span className="font-semibold text-primary-600">
                              ${selectedAlt.price.toFixed(2)}
                            </span>
                            <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100" variant="outline">
                              Save {selectedAlt.savings}%
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        className="h-8 px-2"
                        onClick={() => {
                          setScannedItems(scannedItems.filter(i => i.id !== item.id));
                          setSelectedAlternatives(selectedAlternatives.filter(a => a.originalId !== item.id));
                        }}
                      >
                        <span className="material-icons text-neutral-500">delete</span>
                      </Button>
                    </div>
                    
                    {item.alternatives && item.alternatives.length > 0 && (
                      <div className="mt-2 pl-4 border-l-2 border-primary-100 space-y-2">
                        <div className="text-sm font-medium text-primary-700">Alternatives</div>
                        {item.alternatives.map((alt: any) => (
                          <div key={alt.id} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="text-sm">{alt.name}</span>
                              <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100" variant="outline">
                                Save {alt.savings}%
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">${alt.price.toFixed(2)}</span>
                              <Button 
                                size="sm" 
                                variant={isAlternativeSelected(item.id, alt.id) ? "default" : "outline"}
                                className="h-7 px-2 text-xs"
                                onClick={() => selectAlternative(item, alt)}
                              >
                                {isAlternativeSelected(item.id, alt.id) ? "Selected" : "Select"}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })}
              
              {/* Summary */}
              <div className="pt-4 mt-4 border-t border-neutral-200">
                <div className="flex justify-between mb-2">
                  <span className="text-neutral-600">Original Total:</span>
                  <span>${calculateOriginalTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-green-600 font-medium">Total Savings:</span>
                  <span className="text-green-600 font-medium">-${calculateTotalSavings().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Final Total:</span>
                  <span>${calculateFinalTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="mt-4">
                  <span className="material-icons mr-2">shopping_cart</span>
                  Checkout
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="material-icons text-4xl text-neutral-300 mb-2">shopping_cart</div>
              <h3 className="text-lg font-medium text-neutral-500">Your shopping list is empty</h3>
              <p className="text-neutral-400 mt-1">Search for items to add them to your list</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Suggested Restock Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Suggested Restock Items</CardTitle>
          <CardDescription>
            Based on your purchase history, you might need these items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {purchaseHistory
              .filter(item => item.suggestRestock)
              .map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-neutral-50 rounded-md">
                  <div className="flex items-center">
                    <span className="material-icons text-amber-500 mr-2">history</span>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-neutral-500">Last purchased: {item.lastPurchase}</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="h-8">
                    Add to List
                  </Button>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}