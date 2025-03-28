import { useState, useRef } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

// Sample grocery items database with alternative suggestions and price comparisons
const groceryDatabase = [
  {
    id: 1,
    name: "Branded Oat Crunch Cereal",
    barcode: "7890123456789",
    price: 4.99,
    image: "https://img.icons8.com/fluency/96/cereal.png",
    store: "Walmart",
    alternatives: [
      { 
        id: 101, 
        name: "Store Brand Oat Cereal", 
        price: 2.99, 
        savings: 40, 
        image: "https://img.icons8.com/color/96/cereal-bowl.png",
        store: "Walmart",
        recommendation: "Similar oat cereal available for $2.99. Consider switching to save $2.00."
      }
    ]
  },
  {
    id: 2,
    name: "Premium Almond Milk",
    barcode: "7890123456790",
    price: 5.99,
    image: "https://img.icons8.com/color/96/milk-bottle.png",
    store: "Whole Foods",
    alternatives: [
      { 
        id: 201, 
        name: "Store Brand Almond Milk", 
        price: 3.99, 
        savings: 33,
        image: "https://img.icons8.com/fluency/96/milk-bottle.png",
        store: "Walmart",
        recommendation: "Switch to this store brand to save $2.00 with the same ingredients."
      },
      { 
        id: 202, 
        name: "Organic Soy Milk", 
        price: 4.49, 
        savings: 25,
        image: "https://img.icons8.com/fluency/96/milk.png",
        store: "Kroger",
        recommendation: "Try soy milk as a cheaper alternative with similar nutrition."
      }
    ]
  },
  {
    id: 3,
    name: "Organic Cage-Free Eggs (12pk)",
    barcode: "7890123456791",
    price: 6.99,
    image: "https://img.icons8.com/color/96/eggs.png",
    store: "Whole Foods",
    alternatives: [
      { 
        id: 301, 
        name: "Regular Eggs (12pk)", 
        price: 3.99, 
        savings: 43,
        image: "https://img.icons8.com/fluency/96/eggs.png",
        store: "Walmart",
        recommendation: "Regular eggs are $3.00 cheaper if cage-free isn't essential for you."
      },
      { 
        id: 302, 
        name: "Store Brand Cage-Free Eggs (12pk)", 
        price: 5.49, 
        savings: 21,
        image: "https://img.icons8.com/fluency/96/egg-basket.png",
        store: "Kroger",
        coupon: "10% off with store loyalty card",
        recommendation: "Same cage-free quality but $1.50 cheaper with an additional coupon available."
      }
    ]
  },
  {
    id: 4,
    name: "Organic Baby Spinach (8oz)",
    barcode: "7890123456792",
    price: 4.99,
    image: "https://img.icons8.com/color/96/spinach.png",
    store: "Whole Foods",
    alternatives: [
      { 
        id: 401, 
        name: "Regular Spinach (10oz)", 
        price: 2.99, 
        savings: 40,
        image: "https://img.icons8.com/color/96/vegetarian-food.png",
        store: "Walmart",
        recommendation: "25% more spinach for 40% less money - great value alternative."
      },
      { 
        id: 402, 
        name: "Frozen Organic Spinach (16oz)", 
        price: 1.99, 
        savings: 60,
        image: "https://img.icons8.com/fluency/96/lettuce-1.png",
        store: "Kroger",
        recommendation: "Twice the quantity for less than half the price - just needs defrosting."
      }
    ]
  },
  {
    id: 5,
    name: "Premium Coffee Beans (12oz)",
    barcode: "7890123456793",
    price: 14.99,
    image: "https://img.icons8.com/color/96/coffee-beans-.png",
    store: "Starbucks",
    alternatives: [
      { 
        id: 501, 
        name: "Store Brand Coffee Beans (16oz)", 
        price: 8.99, 
        savings: 40,
        image: "https://img.icons8.com/fluency/96/coffee-beans-.png",
        store: "Walmart",
        recommendation: "33% more coffee for 40% less - highly rated by customers."
      },
      { 
        id: 502, 
        name: "Medium Roast Ground Coffee (16oz)", 
        price: 9.99, 
        savings: 33,
        image: "https://img.icons8.com/color/96/ground-coffee.png",
        store: "Trader Joe's",
        coupon: "Buy one get one 50% off this week",
        recommendation: "Already ground for convenience plus a special promotion this week."
      }
    ]
  }
];

// Sample purchase history to suggest restock items
const purchaseHistory = [
  { 
    id: 1, 
    name: "2% Milk", 
    lastPurchase: "2 weeks ago", 
    suggestRestock: true,
    daysUntilEmpty: 2,
    image: "https://img.icons8.com/color/96/milk.png",
    averageDuration: "14 days"
  },
  { 
    id: 2, 
    name: "Whole Wheat Bread", 
    lastPurchase: "1 week ago", 
    suggestRestock: false,
    daysUntilEmpty: 4,
    image: "https://img.icons8.com/color/96/bread.png", 
    averageDuration: "10 days"
  },
  { 
    id: 3, 
    name: "Eggs", 
    lastPurchase: "3 weeks ago", 
    suggestRestock: true,
    daysUntilEmpty: 0,
    image: "https://img.icons8.com/color/96/eggs.png",
    averageDuration: "21 days"
  },
  { 
    id: 4, 
    name: "Coffee", 
    lastPurchase: "1 month ago", 
    suggestRestock: true,
    daysUntilEmpty: 1,
    image: "https://img.icons8.com/color/96/coffee-beans-.png",
    averageDuration: "30 days"
  },
  { 
    id: 5, 
    name: "Flour", 
    lastPurchase: "2 months ago", 
    suggestRestock: false,
    daysUntilEmpty: 14,
    image: "https://img.icons8.com/color/96/flour.png",
    averageDuration: "3 months"
  }
];

// Weekly savings stats - Alex's progress
const weeklySavings = {
  total: 15.42,
  groceries: 9.87,
  household: 3.25,
  personal: 2.30,
  appliedToDebt: 10.00,
  remaining: 5.42,
  targetWeeklyGoal: 25.00,
  savingsHistory: [
    { week: 'Mar 1-7', amount: 12.50 },
    { week: 'Mar 8-14', amount: 8.75 },
    { week: 'Mar 15-21', amount: 15.42 }
  ],
  savingsAppliedToCards: [
    { card: "Visa Signature", amount: 6.50, date: "Mar 15, 2025" },
    { card: "Chase Freedom", amount: 3.50, date: "Mar 15, 2025" }
  ]
};

export default function GroceryScanner() {
  const [searchTerm, setSearchTerm] = useState("");
  const [scannedItems, setScannedItems] = useState<any[]>([]);
  const [selectedAlternatives, setSelectedAlternatives] = useState<any[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [activeTab, setActiveTab] = useState("scanner");
  const [justScanned, setJustScanned] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(false);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  
  const cameraRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const handleSearch = () => {
    if (searchTerm.trim() === "") return;
    
    // Find item in our mock database
    const foundItem = groceryDatabase.find(
      item => item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
              item.barcode === searchTerm
    );
    
    if (foundItem) {
      handleItemFound(foundItem);
    } else {
      toast({
        title: "Item Not Found",
        description: "Sorry, we couldn't find that grocery item.",
        variant: "destructive"
      });
    }
    
    setSearchTerm("");
  };

  const handleItemFound = (foundItem: any) => {
    // Check if already in scanned items
    if (!scannedItems.some(item => item.id === foundItem.id)) {
      setScannedItems([...scannedItems, foundItem]);
      setJustScanned(foundItem);
      
      toast({
        title: `Product Identified: ${foundItem.name}`,
        description: `Price: $${foundItem.price.toFixed(2)} at ${foundItem.store}. Added to your shopping list.`,
        duration: 5000, // Longer duration for visibility
      });
      
      // The JustScanned item will stay visible until user confirms with check mark
      // so no need for automatic removal
      
      // Display recommendations in a toast as well
      if (foundItem.alternatives && foundItem.alternatives.length > 0) {
        setTimeout(() => {
          const alt = foundItem.alternatives[0];
          const saving = (foundItem.price - alt.price).toFixed(2);
          toast({
            title: `Save $${saving} on ${foundItem.name}!`,
            description: `${alt.recommendation} ${alt.coupon ? `Also: ${alt.coupon}` : ''}`,
            variant: "default",
            duration: 8000, // Make these stay visible longer
          });
        }, 1200);
      }
    } else {
      toast({
        title: "Item Already Added",
        description: `${foundItem.name} is already in your list.`,
        variant: "destructive"
      });
    }
  };

  const toggleCamera = () => {
    if (isCameraActive) {
      // Turn off camera
      setIsCameraActive(false);
      if (cameraRef.current && cameraRef.current.srcObject) {
        const tracks = (cameraRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    } else {
      // Turn on camera
      setIsCameraActive(true);
      
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const constraints = { 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        };
        
        navigator.mediaDevices.getUserMedia(constraints)
          .then(stream => {
            console.log("Camera stream obtained successfully");
            
            if (cameraRef.current) {
              cameraRef.current.srcObject = stream;
              
              // Make sure video is playing
              cameraRef.current.play()
                .then(() => {
                  console.log("Video playback started");
                  
                  // Add event listener to know when video stream is ready
                  cameraRef.current!.onloadedmetadata = () => {
                    console.log("Video metadata loaded, dimensions:", 
                      cameraRef.current?.videoWidth, 
                      cameraRef.current?.videoHeight);
                  };
                })
                .catch(e => console.error("Video play failed:", e));
            }
          })
          .catch(err => {
            console.error("Error accessing camera: ", err);
            toast({
              title: "Camera Access Failed",
              description: "We couldn't access your camera. Please check permissions.",
              variant: "destructive"
            });
            setIsCameraActive(false);
          });
      } else {
        console.error("getUserMedia not supported");
        toast({
          title: "Camera Not Supported",
          description: "Your browser doesn't support camera access.",
          variant: "destructive"
        });
        setIsCameraActive(false);
      }
    }
  };

  // Function to actually capture photo from video stream
  const capturePhoto = () => {
    if (!cameraRef.current || !canvasRef.current) {
      console.error("Cannot capture photo - camera or canvas ref is missing");
      return null;
    }
    
    const video = cameraRef.current;
    const canvas = canvasRef.current;
    
    if (!video.videoWidth || !video.videoHeight) {
      console.error("Video dimensions not available, camera might not be ready");
      return null; 
    }
    
    const context = canvas.getContext('2d');
    
    if (!context) {
      console.error("Cannot get 2D context from canvas");
      return null;
    }
    
    // Make sure canvas is sized to match the video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Clear the canvas first
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw current video frame to canvas
    try {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get data URL from canvas (this is the captured photo)
      const photoUrl = canvas.toDataURL('image/jpeg', 0.9); // Use higher quality
      console.log("Photo captured successfully"); // Debug
      return photoUrl;
    } catch (error) {
      console.error("Error capturing photo:", error);
      return null;
    }
  };

  const simulateScan = () => {
    setIsScanning(true);
    
    // Flash animation effect first (camera shutter)
    // The photo will be "taken" after the flash
    setTimeout(() => {
      // Actually capture photo from camera stream
      const photoUrl = capturePhoto();
      
      if (photoUrl) {
        // Store the captured photo URL
        setCapturedPhotoUrl(photoUrl);
        
        // Quick feedback toast
        toast({
          title: "Photo Captured",
          description: "Processing image...",
          duration: 1500,
        });
        
        // Freeze the image by showing it as a still
        setCapturedPhoto(true);
        
        // Keep the frozen image visible for 2 seconds
        // This makes it feel realistic - like the camera took a photo and is analyzing it
        setTimeout(() => {
          // After the freeze period, start the quick AI analysis animations
          toast({
            title: "Analyzing Product",
            description: "Identifying brand and features...",
            duration: 2000,
          });
          
          // Then pick a random product from our database to "find"
          const randomIndex = Math.floor(Math.random() * groceryDatabase.length);
          const scannedItem = groceryDatabase[randomIndex];
          
          // After a short delay show the results - total process takes about 5-6 seconds
          // which feels more realistic for a computer vision task
          setTimeout(() => {
            if (scannedItem.alternatives && scannedItem.alternatives.length > 0) {
              toast({
                title: `${scannedItem.name} Identified!`,
                description: `Found ${scannedItem.alternatives.length} ways to save up to $${(scannedItem.price - scannedItem.alternatives[0].price).toFixed(2)}`,
                duration: 3000,
              });
            }
            
            // Save the actual photo we took with the product
            const enhancedScannedItem = {
              ...scannedItem,
              capturedPhotoUrl: photoUrl, // Store the actual photo that was taken
              showCapturedPhoto: true // Flag to indicate we should show the real photo
            };
            
            // Add to list and show as just scanned
            setScannedItems([...scannedItems, enhancedScannedItem]);
            setJustScanned(enhancedScannedItem);
            
            // Reset scan states
            setIsScanning(false);
            setCapturedPhoto(false);
          }, 3000);
        }, 2000); // 2 second freeze frame for realism
      } else {
        // If photo capture failed
        toast({
          title: "Capture Failed",
          description: "Unable to take photo. Please try again.",
          variant: "destructive",
        });
        setIsScanning(false);
      }
    }, 200); // Small delay for flash effect before capture
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

  const applySavingsToDebt = () => {
    // Personalized for Alex's credit cards
    toast({
      title: "Savings Applied to Credit Cards",
      description: `$${weeklySavings.remaining.toFixed(2)} has been applied to your Visa Signature ($3.25) and Chase Freedom ($2.17) cards.`,
      variant: "default"
    });
    
    // Show follow-up toast about progress toward weekly goal
    setTimeout(() => {
      const percentComplete = (weeklySavings.total / weeklySavings.targetWeeklyGoal) * 100;
      toast({
        title: `${percentComplete.toFixed(0)}% to Weekly Goal`,
        description: `You've saved $${weeklySavings.total.toFixed(2)} toward your weekly goal of $${weeklySavings.targetWeeklyGoal.toFixed(2)}. Keep going!`,
        variant: "default"
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="scanner" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scanner">Scanner & Savings</TabsTrigger>
          <TabsTrigger value="savings">Savings Report</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scanner" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Smart Grocery AI Vision Scanner</CardTitle>
              <CardDescription>
                Use our computer vision technology to scan products and find better deals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isCameraActive ? (
                <div className="relative">
                  <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                    <video 
                      ref={cameraRef} 
                      autoPlay 
                      playsInline 
                      className="w-full h-full object-cover"
                    ></video>
                    
                    {/* Canvas for capturing photos - hidden */}
                    <canvas 
                      ref={canvasRef} 
                      className="hidden absolute"
                    ></canvas>
                    
                    {/* Scanner animation overlay */}
                    {isScanning && (
                      <>
                        <div className="animate-scanner" />
                        {/* Camera flash animation */}
                        <div className="absolute inset-0 bg-white opacity-0 animate-camera-flash" />
                        
                        {/* Photo captured freeze frame overlay */}
                        {capturedPhoto && (
                          <>
                            {/* Show the actual captured photo instead of the live video feed */}
                            {capturedPhotoUrl && (
                              <div className="absolute inset-0">
                                <img 
                                  src={capturedPhotoUrl} 
                                  alt="Captured product" 
                                  className="w-full h-full object-cover"
                                />
                                
                                {/* Add AI detection boxes over the frozen image */}
                                <div className="absolute inset-0">
                                  {/* Main product detection box */}
                                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    <div className="h-32 w-32 border-2 border-blue-500 rounded-sm animate-pulse-slow">
                                      {/* Corner markers */}
                                      <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-blue-500"></div>
                                      <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-blue-500"></div>
                                      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-blue-500"></div>
                                      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-blue-500"></div>
                                    </div>
                                    <div className="absolute -top-8 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                      <span className="flex items-center whitespace-nowrap">
                                        <span className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></span>
                                        Analyzing product...
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {/* Nutritional info detection */}
                                  <div className="absolute bottom-1/4 right-1/4 h-16 w-24 border border-yellow-400 rounded-sm">
                                    <div className="absolute -top-6 left-0 bg-yellow-500 bg-opacity-80 text-white text-xs px-2 py-0.5 rounded">
                                      <span className="flex items-center whitespace-nowrap">
                                        Nutrition Facts
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {/* Barcode detection */}
                                  <div className="absolute top-2/3 left-1/4 h-10 w-16 border border-green-400 rounded-sm">
                                    <div className="absolute -top-6 left-0 bg-green-500 bg-opacity-80 text-white text-xs px-2 py-0.5 rounded">
                                      <span className="flex items-center whitespace-nowrap">
                                        UPC Code
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <div className="absolute inset-0 flex flex-col items-center justify-between p-4">
                              <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
                                <div className="flex items-center">
                                  <span className="material-icons text-red-500 mr-2 animate-pulse">lens</span>
                                  <span className="font-medium">Photo Captured</span>
                                </div>
                              </div>
                              
                              <div className="flex mt-auto w-full justify-between">
                                <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded text-xs">
                                  <span className="flex items-center">
                                    <span className="material-icons text-xs mr-1">aspect_ratio</span>
                                    Product detected
                                  </span>
                                </div>
                                <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded text-xs">
                                  <span className="flex items-center">
                                    <span className="material-icons text-xs mr-1">lightbulb</span>
                                    Identifying product...
                                  </span>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </>
                    )}
                    
                    {/* AI vision detection overlay */}
                    <div className="absolute inset-0">
                      <div className="border border-blue-400 w-10 h-10 absolute top-14 left-20 rounded-sm opacity-30" />
                      <div className="border border-green-400 w-14 h-8 absolute bottom-24 right-16 rounded-sm opacity-30" />
                      <div className="border border-yellow-400 w-20 h-16 absolute top-1/3 right-1/3 rounded-sm opacity-30" />
                      
                      {/* Product detection markers */}
                      {!isScanning && (
                        <div className="absolute top-1/4 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="h-16 w-16 border-2 border-green-500 rounded-sm opacity-40 animate-pulse-slow" />
                          <div className="absolute -top-6 -left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                            <span className="flex items-center">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                              Target detected
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                      {isScanning ? (
                        <div className="flex flex-col items-center">
                          <div className="animate-pulse-border flex items-center justify-center h-24 w-64 bg-primary bg-opacity-20 rounded-lg">
                            <div className="flex flex-col items-center">
                              <div className="text-white font-medium mb-1">
                                <span className="inline-block animate-typing-cursor">Processing image</span>
                              </div>
                              <div className="text-xs text-white mb-2">
                                Detecting brand, price & nutritional info
                              </div>
                              <div className="w-40 h-1.5 bg-white bg-opacity-20 rounded-full overflow-hidden">
                                <div className="h-full bg-white animate-progress-linear"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-primary w-64 h-24 rounded-lg flex items-center justify-center">
                          <div className="flex flex-col items-center">
                            <span className="text-sm text-white bg-black bg-opacity-70 p-1 rounded mb-1">
                              Position product label in frame
                            </span>
                            <span className="text-xs text-white bg-black bg-opacity-50 px-1 py-0.5 rounded">
                              AI will identify best price alternatives
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                      <button
                        onClick={simulateScan}
                        disabled={isScanning}
                        className="bg-primary text-white py-2 px-4 rounded-full font-medium flex items-center justify-center disabled:opacity-50"
                      >
                        {isScanning ? (
                          <span className="flex items-center animate-blink-slow">
                            <span className="material-icons mr-2">hourglass_top</span> Analyzing product...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <span className="material-icons mr-2">photo_camera</span> Tap to Scan
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="absolute top-2 right-2"
                    onClick={toggleCamera}
                  >
                    <span className="material-icons">close</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      className="flex-1"
                      placeholder="Search for grocery items (try 'Cereal', 'Coffee', 'Eggs', or 'Spinach')"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearch();
                      }}
                    />
                    <Button onClick={handleSearch}>
                      <span className="material-icons mr-2">search</span>
                      Search
                    </Button>
                  </div>
                  
                  <Button 
                    onClick={toggleCamera} 
                    variant="outline" 
                    className="w-full py-8 bg-neutral-50 hover:bg-neutral-100 border-dashed border-2"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <span className="material-icons text-4xl text-neutral-400 mb-2">photo_camera</span>
                      <span className="font-medium">Tap to Scan Products</span>
                      <span className="text-xs text-neutral-500 mt-1">Use computer vision to find instant savings</span>
                    </div>
                  </Button>
                </div>
              )}
              
              {/* Just scanned item alert */}
              {justScanned && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 animate-pulse-border">
                  <div className="flex flex-col">
                    <div className="flex items-start space-x-3">
                      {/* Show the captured photo prominently if available */}
                      <div className="relative min-w-[160px]">
                        {justScanned.showCapturedPhoto && justScanned.capturedPhotoUrl ? (
                          <div className="relative rounded-md overflow-hidden shadow-lg" style={{ width: '160px', height: '120px' }}>
                            {/* The actual captured photo */}
                            <img 
                              src={justScanned.capturedPhotoUrl} 
                              alt={`Photo of ${justScanned.name}`} 
                              className="w-full h-full object-cover" 
                            />
                            
                            {/* Product detection overlay with AI detection elements */}
                            <div className="absolute inset-0">
                              {/* Main product detection box */}
                              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                <div className="h-20 w-20 border-2 border-blue-500 rounded-sm">
                                  {/* Corner markers for box */}
                                  <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-blue-500"></div>
                                  <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-blue-500"></div>
                                  <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-blue-500"></div>
                                  <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-blue-500"></div>
                                </div>
                              </div>
                              
                              {/* Nutritional info label detection */}
                              <div className="absolute bottom-8 right-6 h-12 w-20 border border-yellow-400 rounded-sm">
                              </div>
                              
                              {/* Barcode detection area */}
                              <div className="absolute top-6 left-8 h-8 w-12 border border-green-400 rounded-sm">
                              </div>
                            </div>
                            
                            {/* "Your photo" badge */}
                            <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl-md shadow-sm">
                              <span className="flex items-center">
                                <span className="material-icons text-xs mr-1">check_circle</span>
                                Captured
                              </span>
                            </div>
                            
                            {/* Timestamp overlay */}
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs px-2 py-1 flex justify-between items-center">
                              <span className="flex items-center">
                                <span className="material-icons text-xs mr-1">photo_camera</span>
                                {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                              <span className="flex items-center">
                                <span className="text-blue-300">97%</span>
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white p-2 rounded-md border border-blue-200 shadow-sm" style={{ width: '160px', height: '120px' }}>
                            <div className="flex justify-center items-center h-full">
                              <img src={justScanned.image} alt={justScanned.name} className="max-h-full max-w-full object-contain" />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-blue-900 text-lg">{justScanned.name}</h4>
                          <Badge className="bg-blue-200 text-blue-800 hover:bg-blue-200" variant="outline">
                            <span className="flex items-center">
                              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-1"></span>
                              Detected
                            </span>
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-blue-700 font-medium mt-1">
                          <span className="flex items-center">
                            <span className="material-icons text-sm mr-1">attach_money</span>
                            ${justScanned.price.toFixed(2)} at {justScanned.store}
                          </span>
                        </div>
                        
                        <div className="mt-2 text-xs text-neutral-600 bg-white bg-opacity-50 rounded px-2 py-1">
                          <div className="flex items-center">
                            <span className="material-icons text-xs mr-1 text-blue-500">check_circle</span>
                            Product identified with 97% confidence
                          </div>
                          <div className="mt-1 flex items-center">
                            <span className="material-icons text-xs mr-1 text-amber-500">info</span>
                            Nutrition and pricing details verified
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-500 h-8 w-8 rounded-full"
                        onClick={() => setJustScanned(null)}
                      >
                        <span className="material-icons">check_circle</span>
                      </Button>
                    </div>
                    
                    {/* Alternatives with larger images */}
                    {justScanned.alternatives && justScanned.alternatives.length > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center mb-2">
                          <div className="p-1 bg-amber-100 rounded-full mr-2">
                            <span className="material-icons text-amber-600">savings</span>
                          </div>
                          <span className="font-medium text-amber-800">Savings Opportunities</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                          {justScanned.alternatives.map((alt: any, index: number) => (
                            <div key={alt.id} className="bg-white rounded-lg border border-amber-200 overflow-hidden">
                              <div className="bg-amber-50 px-3 py-2 border-b border-amber-100 flex justify-between items-center">
                                <span className="font-medium text-amber-800">{alt.name}</span>
                                <Badge className="bg-green-100 text-green-700">
                                  Save ${(justScanned.price - alt.price).toFixed(2)}
                                </Badge>
                              </div>
                              
                              <div className="p-3">
                                <div className="flex items-start">
                                  <div className="bg-white mr-3 rounded border border-neutral-200 p-1" style={{ minWidth: '80px', height: '80px' }}>
                                    <img 
                                      src={alt.image} 
                                      alt={alt.name} 
                                      className="w-full h-full object-contain" 
                                    />
                                  </div>
                                  
                                  <div className="flex-1">
                                    <div className="flex items-baseline">
                                      <span className="text-green-600 font-medium">${alt.price.toFixed(2)}</span>
                                      <span className="text-neutral-400 text-xs line-through ml-2">
                                        ${justScanned.price.toFixed(2)}
                                      </span>
                                    </div>
                                    
                                    <p className="text-xs text-neutral-600 mt-1 leading-snug">
                                      {alt.recommendation}
                                    </p>
                                    
                                    {alt.coupon && (
                                      <div className="flex items-center mt-2 bg-blue-50 rounded-sm px-2 py-1">
                                        <span className="material-icons text-xs text-blue-500 mr-1">local_offer</span>
                                        <span className="text-xs text-blue-600">{alt.coupon}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="mt-3 flex justify-between items-center">
                                  <div className="flex items-center">
                                    <div className="p-1 bg-green-100 rounded-full mr-1">
                                      <span className="material-icons text-green-600" style={{ fontSize: '14px' }}>eco</span>
                                    </div>
                                    <span className="text-xs text-green-700">Better choice</span>
                                  </div>
                                  
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-7 text-xs"
                                    onClick={() => {
                                      // When the user clicks to add the alternative, we'll replace the original
                                      // with the alternative in their list and show a toast
                                      if (justScanned) {
                                        // Remove the original
                                        setScannedItems(prevItems => 
                                          prevItems.filter(item => item.id !== justScanned.id)
                                        );
                                        
                                        // Add the alternative with the captured photo if available
                                        const enhancedAlt = justScanned.capturedPhotoUrl ? {
                                          ...alt,
                                          capturedPhotoUrl: justScanned.capturedPhotoUrl,
                                          showCapturedPhoto: true
                                        } : alt;
                                        
                                        setScannedItems(prevItems => [...prevItems, enhancedAlt]);
                                        
                                        // Close the "just scanned" card
                                        setJustScanned(null);
                                        
                                        // Show success toast
                                        toast({
                                          title: "Smart Swap Applied!",
                                          description: `Added ${alt.name} instead of ${justScanned.name}, saving $${(justScanned.price - alt.price).toFixed(2)}`,
                                          variant: "default",
                                        });
                                      }
                                    }}
                                  >
                                    <span className="flex items-center">
                                      <span className="material-icons text-xs mr-1">shopping_cart_checkout</span> Choose This
                                    </span>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Shopping List */}
              {scannedItems.length > 0 && (
                <div className="space-y-4 mt-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Shopping List ({scannedItems.length} items)</h3>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100" variant="outline">
                      {selectedAlternatives.length} smart swaps
                    </Badge>
                  </div>
                  
                  {scannedItems.map((item) => {
                    const isAltSelected = selectedAlternatives.some(alt => alt.originalId === item.id);
                    const selectedAlt = selectedAlternatives.find(alt => alt.originalId === item.id)?.alternative;
                    
                    return (
                      <Card key={item.id} className="overflow-hidden">
                        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
                          <div className="flex items-center">
                            {/* Show captured photo if available */}
                            {item.showCapturedPhoto && item.capturedPhotoUrl ? (
                              <div className="rounded mr-3 border border-neutral-100 overflow-hidden relative" style={{ width: '60px', height: '60px' }}>
                                <img 
                                  src={item.capturedPhotoUrl} 
                                  alt={`Photo of ${item.name}`} 
                                  className="w-full h-full object-cover" 
                                />
                                
                                {/* Small indicator for captured photo */}
                                <div className="absolute bottom-0 right-0 bg-blue-500 text-white text-[8px] px-1">
                                  Photo
                                </div>
                              </div>
                            ) : (
                              <div className="bg-white p-1 rounded mr-3 border border-neutral-100">
                                <img src={item.image} alt={item.name} className="w-12 h-12 object-contain" />
                              </div>
                            )}
                            
                            <div>
                              <h4 className="font-medium">{item.name}</h4>
                              <div className="flex items-center">
                                {isAltSelected ? (
                                  <div className="text-sm line-through text-neutral-500 mr-2">
                                    ${item.price.toFixed(2)}
                                  </div>
                                ) : (
                                  <div className="text-sm font-semibold">
                                    ${item.price.toFixed(2)} at {item.store}
                                  </div>
                                )}
                                
                                {isAltSelected && (
                                  <div className="flex items-center">
                                    <span className="font-semibold text-primary-600 mr-1">
                                      ${selectedAlt.price.toFixed(2)}
                                    </span>
                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100" variant="outline">
                                      Save ${(item.price - selectedAlt.price).toFixed(2)}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                              
                              {/* Add "Your photo" indicator if it's captured */}
                              {item.showCapturedPhoto && item.capturedPhotoUrl && (
                                <div className="text-xs text-neutral-500 mt-0.5 flex items-center">
                                  <span className="material-icons text-[12px] mr-1">photo_camera</span>
                                  Scanned {new Date().toLocaleDateString([], {month: 'short', day: 'numeric'})}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <Button 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setScannedItems(scannedItems.filter(i => i.id !== item.id));
                              setSelectedAlternatives(selectedAlternatives.filter(a => a.originalId !== item.id));
                            }}
                          >
                            <span className="material-icons text-neutral-500">delete</span>
                          </Button>
                        </div>
                        
                        {item.alternatives && item.alternatives.length > 0 && (
                          <div className="bg-neutral-50 p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center">
                                <div className="p-1 bg-amber-100 rounded-full mr-2">
                                  <span className="material-icons text-amber-600" style={{ fontSize: '16px' }}>compare</span>
                                </div>
                                <span className="text-sm font-medium text-neutral-700">Similar Products for Less</span>
                              </div>
                              <div className="text-xs text-neutral-500">Sorted by best value</div>
                            </div>
                            
                            <div className="space-y-3">
                              {item.alternatives.map((alt: any) => (
                                <div key={alt.id} className="bg-white rounded-lg border border-neutral-200 p-3">
                                  <div className="flex items-start">
                                    <div className="bg-white p-1 rounded mr-3 border border-neutral-100">
                                      <img src={alt.image} alt={alt.name} className="w-10 h-10 object-contain" />
                                    </div>
                                    
                                    <div className="flex-1">
                                      <div className="flex justify-between">
                                        <div>
                                          <h5 className="font-medium text-sm">{alt.name}</h5>
                                          <div className="flex items-center">
                                            <div className="text-sm text-neutral-600 font-medium mr-2">
                                              ${alt.price.toFixed(2)}
                                            </div>
                                            <div className="text-xs text-neutral-500 line-through">
                                              ${item.price.toFixed(2)}
                                            </div>
                                          </div>
                                          <div className="text-xs text-neutral-500 mt-0.5">
                                            Available at {alt.store}
                                          </div>
                                          {alt.coupon && (
                                            <div className="flex items-center mt-1 bg-blue-50 py-0.5 px-1.5 rounded-sm w-fit">
                                              <span className="material-icons text-xs text-blue-500 mr-1">local_offer</span>
                                              <span className="text-xs text-blue-600">{alt.coupon}</span>
                                            </div>
                                          )}
                                        </div>
                                        
                                        <div className="flex flex-col items-end">
                                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 mb-1" variant="outline">
                                            <span className="flex items-center">
                                              <span className="material-icons mr-0.5" style={{ fontSize: '12px' }}>trending_down</span>
                                              {alt.savings}% less
                                            </span>
                                          </Badge>
                                          <div className="text-xs text-green-600 font-medium">
                                            Save ${(item.price - alt.price).toFixed(2)}
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="mt-2 text-xs text-neutral-600 border-t border-neutral-100 pt-2">
                                        {alt.recommendation}
                                      </div>
                                      
                                      <div className="mt-2 flex justify-end">
                                        <Button 
                                          size="sm" 
                                          variant={isAlternativeSelected(item.id, alt.id) ? "default" : "outline"}
                                          className="h-7 text-xs"
                                          onClick={() => selectAlternative(item, alt)}
                                        >
                                          {isAlternativeSelected(item.id, alt.id) ? (
                                            <span className="flex items-center">
                                              <span className="material-icons text-sm mr-1">check</span> Selected
                                            </span>
                                          ) : (
                                            <span className="flex items-center">
                                              <span className="material-icons text-sm mr-1">shopping_cart_checkout</span> Choose This Instead
                                            </span>
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                  
                  {/* Summary */}
                  <Card className="bg-neutral-50 border border-neutral-200">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex justify-between mb-2">
                          <span className="text-neutral-600">Original Total:</span>
                          <span>${calculateOriginalTotal().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-green-600 font-medium flex items-center">
                            <span className="material-icons text-sm mr-1">trending_down</span> Total Savings:
                          </span>
                          <span className="text-green-600 font-medium">-${calculateTotalSavings().toFixed(2)}</span>
                        </div>
                        <div className="pt-2 border-t border-neutral-200">
                          <div className="flex justify-between text-lg font-bold">
                            <span>Final Total:</span>
                            <span>${calculateFinalTotal().toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="justify-end border-t border-neutral-200 bg-white">
                      <Button className="mt-2">
                        <span className="material-icons mr-2">shopping_cart</span>
                        Checkout
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Suggested Restock Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Suggested Restock Items</CardTitle>
              <CardDescription>
                Based on your purchase history and consumption patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {purchaseHistory
                  .filter(item => item.suggestRestock)
                  .map(item => (
                    <div key={item.id} className="flex justify-between items-center border border-neutral-200 rounded-lg overflow-hidden">
                      <div className="flex items-center p-3">
                        <div className="bg-white p-1 rounded mr-3 border border-neutral-100">
                          <img src={item.image} alt={item.name} className="w-12 h-12 object-contain" />
                        </div>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-neutral-500">Last purchased: {item.lastPurchase}</div>
                          <div className="flex items-center mt-1">
                            <span className="text-xs font-medium mr-2">
                              {item.daysUntilEmpty <= 0 
                                ? "Likely empty now" 
                                : `${item.daysUntilEmpty} days until empty`}
                            </span>
                            {item.daysUntilEmpty <= 1 && (
                              <Badge className="bg-red-100 text-red-800 hover:bg-red-100" variant="outline">
                                Low
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="pr-3">
                        <Button variant="outline" size="sm">
                          <span className="material-icons text-sm mr-1">add_shopping_cart</span>
                          Add
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="savings">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Savings Report</CardTitle>
              <CardDescription>
                Track your smart shopping savings and apply them to reduce debt
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-green-50 border-green-100">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm text-green-700 font-medium">Total Savings This Week</h3>
                      <span className="material-icons text-green-500">savings</span>
                    </div>
                    <div className="text-2xl font-bold text-green-700">
                      ${weeklySavings.total.toFixed(2)}
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      March 15-21, 2025
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-50 border-blue-100">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm text-blue-700 font-medium">Applied to Debt</h3>
                      <span className="material-icons text-blue-500">credit_card</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-700">
                      ${weeklySavings.appliedToDebt.toFixed(2)}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-xs text-blue-600">
                        Remaining to apply: ${weeklySavings.remaining.toFixed(2)}
                      </div>
                      <Button 
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs bg-white"
                        onClick={applySavingsToDebt}
                      >
                        Apply Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-sm font-medium mb-2">Savings by Category</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Groceries</span>
                          <span>${weeklySavings.groceries.toFixed(2)}</span>
                        </div>
                        <Progress value={64} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Household</span>
                          <span>${weeklySavings.household.toFixed(2)}</span>
                        </div>
                        <Progress value={21} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Personal Care</span>
                          <span>${weeklySavings.personal.toFixed(2)}</span>
                        </div>
                        <Progress value={15} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Savings History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {weeklySavings.savingsHistory.map((week, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-neutral-50 rounded-md">
                        <div>
                          <div className="font-medium">{week.week}</div>
                          <div className="text-xs text-neutral-500">
                            {index === weeklySavings.savingsHistory.length - 1 ? 'Current week' : 'Previous week'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-green-600">${week.amount.toFixed(2)}</div>
                          <div className="text-xs text-neutral-500">
                            {week.amount > 10 ? 'Great savings!' : 'Good progress'}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="text-center pt-2">
                      <span className="text-xs text-neutral-500">Total savings to date: $156.84</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Smart Shopping Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex">
                      <span className="material-icons text-amber-500 mr-2">lightbulb</span>
                      <div>
                        <h4 className="font-medium text-sm">Scan Before You Buy</h4>
                        <p className="text-sm text-neutral-600">
                          Always scan items, especially pantry staples like cereal, coffee, and snacks 
                          to find store brand alternatives that can save up to 40%.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <span className="material-icons text-amber-500 mr-2">schedule</span>
                      <div>
                        <h4 className="font-medium text-sm">Time Your Shopping</h4>
                        <p className="text-sm text-neutral-600">
                          Shop on Wednesdays when most stores start their weekly sales, 
                          giving you the best selection of discounted items.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <span className="material-icons text-amber-500 mr-2">local_offer</span>
                      <div>
                        <h4 className="font-medium text-sm">Stack Savings</h4>
                        <p className="text-sm text-neutral-600">
                          Combine store loyalty programs with the alternatives we suggest to 
                          maximize your savings on every shopping trip.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
    </div>
  );
}