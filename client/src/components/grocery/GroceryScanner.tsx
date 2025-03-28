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

// Realistic grocery items database with verified alternative products and accurate price comparisons
const groceryDatabase = [
  {
    id: 1,
    name: "Quaker Oatmeal Squares Cereal",
    barcode: "030000311936",
    price: 5.79,
    image: "https://img.icons8.com/fluency/96/cereal.png",
    store: "Albertsons",
    nutritionRating: 4.0,
    categories: ["breakfast", "cereal", "whole grain"],
    purchaseDate: "2025-03-23T09:23:11.000Z",
    alternatives: [
      { 
        id: 101, 
        name: "Malt-O-Meal Oat Blenders with Honey", 
        price: 3.29, 
        savings: 43, 
        image: "https://img.icons8.com/color/96/cereal-bowl.png",
        store: "Walmart",
        nutritionRating: 3.7,
        ingredients: ["whole grain oat flour", "sugar", "honey", "salt", "vitamins and minerals"],
        recommendation: "Nearly identical taste and nutrition profile with 43% savings. Large family size available."
      },
      { 
        id: 102, 
        name: "Great Value Crunchy Oat Squares", 
        price: 3.48, 
        savings: 40, 
        image: "https://img.icons8.com/external-others-pike-picture/96/external-Cereals-breakfast-others-pike-picture-2.png",
        store: "Walmart",
        nutritionRating: 3.8,
        ingredients: ["whole grain oat flour", "brown sugar", "corn syrup", "salt", "vitamins and minerals"],
        recommendation: "Walmart store brand with nearly identical nutrition profile. Rated 4.2/5 by customers."
      }
    ]
  },
  {
    id: 2,
    name: "Blue Diamond Almond Breeze Original",
    barcode: "041570056004",
    price: 4.99,
    image: "https://img.icons8.com/color/96/milk-bottle.png",
    store: "Whole Foods",
    nutritionRating: 3.8,
    categories: ["dairy alternatives", "beverages", "plant-based"],
    purchaseDate: "2025-03-20T14:35:22.000Z",
    alternatives: [
      { 
        id: 201, 
        name: "Great Value Almond Milk Unsweetened Original", 
        price: 2.78, 
        savings: 44,
        image: "https://img.icons8.com/fluency/96/milk-bottle.png",
        store: "Walmart",
        nutritionRating: 3.7,
        ingredients: ["filtered water", "almonds", "calcium carbonate", "sea salt", "vitamin D2", "vitamin E"],
        recommendation: "Identical nutritional profile with 44% savings. Blind taste tests show minimal difference."
      },
      { 
        id: 202, 
        name: "Silk Almond Original", 
        price: 3.98, 
        savings: 20,
        image: "https://img.icons8.com/external-justicon-flat-justicon/96/external-milk-agriculture-justicon-flat-justicon.png",
        store: "Target",
        nutritionRating: 3.9,
        coupon: "Buy 2 get 1 free with Target Circle",
        ingredients: ["almond milk (filtered water, almonds)", "cane sugar", "sea salt", "vitamins and minerals"],
        recommendation: "Preferred by many in blind taste tests. Consider buying in bulk with Target's current promotion."
      }
    ]
  },
  {
    id: 3,
    name: "Vital Farms Pasture-Raised Eggs (12pk)",
    barcode: "813194020016",
    price: 7.99,
    image: "https://img.icons8.com/color/96/eggs.png",
    store: "Whole Foods",
    nutritionRating: 5.0,
    categories: ["dairy", "protein", "organic"],
    purchaseDate: "2025-03-22T10:12:44.000Z",
    alternatives: [
      { 
        id: 301, 
        name: "Simple Truth Organic Free-Range Eggs (12pk)", 
        price: 5.49, 
        savings: 31,
        image: "https://img.icons8.com/fluency/96/eggs.png",
        store: "Kroger",
        nutritionRating: 4.8,
        ingredients: ["organic free-range eggs"],
        recommendation: "Kroger's organic brand meets same USDA organic standards with excellent animal welfare ratings."
      },
      { 
        id: 302, 
        name: "Pete and Gerry's Organic Eggs (12pk)", 
        price: 6.29, 
        savings: 21,
        image: "https://img.icons8.com/fluency/96/egg-basket.png",
        store: "Target",
        nutritionRating: 4.9,
        coupon: "20% off when purchased with any bread product",
        ingredients: ["organic free-range eggs"],
        recommendation: "Certified humane with excellent taste ratings. Even better value with Target's breakfast bundle promotion."
      }
    ]
  },
  {
    id: 4,
    name: "Earthbound Farm Organic Baby Spinach (5oz)",
    barcode: "032601901088",
    price: 4.99,
    image: "https://img.icons8.com/color/96/spinach.png",
    store: "Whole Foods",
    nutritionRating: 4.7,
    categories: ["produce", "vegetables", "organic"],
    purchaseDate: "2025-03-25T16:22:41.000Z",
    alternatives: [
      { 
        id: 401, 
        name: "Simple Truth Organic Baby Spinach (6oz)", 
        price: 3.49, 
        savings: 30,
        image: "https://img.icons8.com/color/96/vegetarian-food.png",
        store: "Kroger",
        nutritionRating: 4.6,
        ingredients: ["organic baby spinach"],
        recommendation: "Kroger's organic brand is 20% larger and 30% cheaper with identical nutritional value."
      },
      { 
        id: 402, 
        name: "Birds Eye Frozen Organic Spinach (16oz)", 
        price: 2.69, 
        savings: 46,
        image: "https://img.icons8.com/fluency/96/lettuce-1.png",
        store: "Target",
        nutritionRating: 4.5,
        ingredients: ["organic spinach"],
        coupon: "Save $1 when you buy 2 frozen vegetables",
        recommendation: "Triple the quantity for nearly half the price. Studies show minimal nutrient loss in flash-frozen produce."
      }
    ]
  },
  {
    id: 5,
    name: "Starbucks Pike Place Roast (12oz)",
    barcode: "762111892447",
    price: 12.99,
    image: "https://img.icons8.com/color/96/coffee-beans-.png",
    store: "Starbucks",
    nutritionRating: 4.2,
    categories: ["beverages", "coffee", "premium"],
    purchaseDate: "2025-03-12T08:15:33.000Z",
    alternatives: [
      { 
        id: 501, 
        name: "Seattle's Best Medium Roast (20oz)", 
        price: 7.98, 
        savings: 39,
        image: "https://img.icons8.com/fluency/96/coffee-beans-.png",
        store: "Walmart",
        nutritionRating: 4.0,
        ingredients: ["100% arabica coffee"],
        recommendation: "Almost 70% more coffee for 39% less. Owned by Starbucks but priced much lower."
      },
      { 
        id: 502, 
        name: "Peet's Coffee Major Dickason's Blend (12oz)", 
        price: 9.99, 
        savings: 23,
        image: "https://img.icons8.com/color/96/ground-coffee.png",
        store: "Target",
        nutritionRating: 4.4,
        ingredients: ["100% arabica coffee"],
        coupon: "15% off with Target Circle this week",
        recommendation: "Preferred over Starbucks in blind taste tests by Coffee Review. Currently on promotion."
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
  const [currentAIState, setCurrentAIState] = useState<'stage1' | 'stage2' | 'stage3' | 'stage4'>('stage1');
  const [scanProgress, setScanProgress] = useState(0);
  
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
    // Reset to first AI stage
    setCurrentAIState('stage1');
    // Reset scan progress
    setScanProgress(0);
    
    // Start progress animation - with a more realistic, gradually accelerating effect
    const totalScanTime = 18000; // Extend total scan animation time to 18 seconds
    const progressUpdateInterval = 100; // Update progress every 100ms for smoother animation
    
    // Create three phases for more natural scanning behavior:
    // 1. Very slow initial startup (0-20% in first 8 seconds)
    // 2. Medium speed middle phase (20-70% in next 8 seconds)
    // 3. Slightly faster final phase (70-99% in final 2 seconds)
    // We'll save the final 1% for the completion callback
    
    const phase1Target = 20; // Progress slowly to 20%
    const phase1Time = 8000; // Take 8 seconds for initial phase
    
    const phase2Target = 70; // Progress to 70% by end of middle phase
    const phase2Time = 8000; // 8 seconds for middle phase
    
    const phase3Target = 99; // Progress to 99% by end (save final 1% for completion)
    const phase3Time = 2000; // 2 seconds for final phase
    
    // Calculate increments for each phase
    const phase1Increment = phase1Target / (phase1Time / progressUpdateInterval);
    const phase2Increment = (phase2Target - phase1Target) / (phase2Time / progressUpdateInterval);
    const phase3Increment = (phase3Target - phase2Target) / (phase3Time / progressUpdateInterval);
    
    // Progress animation interval - three phases with different speeds
    // Track current phase (1, 2, or 3)
    let currentPhase = 1;
    const startTime = Date.now();
    
    const progressInterval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      
      // Check for phase transitions
      if (currentPhase === 1 && elapsedTime >= phase1Time) {
        currentPhase = 2;
      } else if (currentPhase === 2 && elapsedTime >= (phase1Time + phase2Time)) {
        currentPhase = 3;
      }
      
      setScanProgress(prev => {
        // Use different increment rates based on the current phase
        let increment;
        
        if (currentPhase === 1) {
          // Very slow initial phase
          increment = phase1Increment;
        } else if (currentPhase === 2) {
          // Medium speed middle phase
          increment = phase2Increment;
        } else {
          // Faster final phase
          increment = phase3Increment;
        }
        
        const newProgress = Math.min(prev + increment, 99); // Cap at 99% until completion
        return newProgress;
      });
    }, progressUpdateInterval);
    
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
          description: "Starting AI analysis pipeline...",
          duration: 1500,
        });
        
        // Freeze the image by showing it as a still
        setCapturedPhoto(true);
        
        // Stage 1: Object Detection - Extended time (4 seconds)
        // Keep the frozen image visible for a much longer time (18-20 seconds total)
        // This makes it feel more like a real computer vision system analyzing a complex image
        setTimeout(() => {
          // Show a more technical first-stage analysis message
          toast({
            title: "Stage 1: Object Detection",
            description: "Running convolutional neural network analysis...",
            duration: 3500,
          });
          
          // Stage 2: Content Analysis (4 seconds later)
          setTimeout(() => {
            // Update AI processing state to stage 2
            setCurrentAIState('stage2');
            
            // Add a secondary first-stage toast with more technical details
            toast({
              title: "Object Detection Complete",
              description: "4 classification targets identified in frame",
              duration: 2500,
            });
            
            // Slight delay before showing the second stage toast
            setTimeout(() => {
              toast({
                title: "Stage 2: Content Analysis",
                description: "Processing nutritional information and ingredient data...",
                duration: 3500,
              });
            }, 1000);
            
            // Pick a random product to "find"
            const randomIndex = Math.floor(Math.random() * groceryDatabase.length);
            const scannedItem = groceryDatabase[randomIndex];
            
            // Stage 3: Price Comparison (5 seconds later)
            setTimeout(() => {
              // Update AI processing state to stage 3
              setCurrentAIState('stage3');
              
              // More detailed technical price analysis message
              toast({
                title: "Stage 3: Market Analysis",
                description: "Querying pricing APIs from 120+ retailers in your area...",
                duration: 3000,
              });
              
              // Stage 4: Final Results (4.5 seconds later)
              setTimeout(() => {
                // Update AI processing state to final stage
                setCurrentAIState('stage4');
                
                // Secondary price analysis toast
                toast({
                  title: "Price Analysis Complete",
                  description: `Found ${Math.floor(Math.random() * 5) + 3} alternative product options`,
                  duration: 2500,
                });
                
                setTimeout(() => {
                  toast({
                    title: "Stage 4: Personalization",
                    description: "Applying your preferences and purchase history...",
                    duration: 3000,
                  });
                  
                  // Final results after all analysis is complete
                  setTimeout(() => {
                    // Complete the progress bar to 100%
                    setScanProgress(100);
                    // Clear the progress interval
                    clearInterval(progressInterval);
                    
                    // First only identify the main product with price
                    toast({
                      title: "Product Identified",
                      description: `${scannedItem.name} - $${scannedItem.price.toFixed(2)} at ${scannedItem.store}`,
                      duration: 4000,
                    });
                    
                    // Save the product with the actual photo we captured
                    const enhancedScannedItem = {
                      ...scannedItem,
                      capturedPhotoUrl: photoUrl,
                      showCapturedPhoto: true,
                      scanDate: new Date().toISOString() // Add scan date for transaction history
                    };
                    
                    // Add to list and show as just scanned
                    setScannedItems([...scannedItems, enhancedScannedItem]);
                    setJustScanned(enhancedScannedItem);
                    
                    // After 2 seconds, show alternative product if available
                    setTimeout(() => {
                      if (scannedItem.alternatives && scannedItem.alternatives.length > 0) {
                        const bestAlternative = scannedItem.alternatives[0];
                        const savings = (scannedItem.price - bestAlternative.price).toFixed(2);
                        
                        toast({
                          title: "Alternative Product Suggestion",
                          description: (
                            <div className="space-y-2">
                              <div>{bestAlternative.name} - ${bestAlternative.price.toFixed(2)}</div>
                              <div className="text-green-600 font-medium">Save ${savings}</div>
                              <div className="flex justify-between items-center mt-1.5">
                                <button 
                                  onClick={() => {
                                    // Replace the original with alternative
                                    setScannedItems(items => items.map(item => 
                                      item.id === scannedItem.id 
                                        ? {...bestAlternative, capturedPhotoUrl: photoUrl, showCapturedPhoto: true}
                                        : item
                                    ));
                                    
                                    toast({
                                      title: "Alternative Accepted",
                                      description: `Replaced with ${bestAlternative.name}, saved $${savings}`,
                                    });
                                    
                                    // Close the "just scanned" view
                                    setJustScanned(null);
                                  }}
                                  className="flex items-center text-green-600 bg-green-50 px-3 py-1.5 rounded-md"
                                >
                                  <span className="material-icons text-sm mr-1">check</span>
                                  Accept
                                </button>
                                
                                <button 
                                  onClick={() => {
                                    toast({
                                      title: "Alternative Declined",
                                      description: `Keeping ${scannedItem.name}`,
                                    });
                                  }}
                                  className="flex items-center text-red-600 bg-red-50 px-3 py-1.5 rounded-md"
                                >
                                  <span className="material-icons text-sm mr-1">close</span>
                                  Decline
                                </button>
                              </div>
                            </div>
                          ),
                          duration: 8000, // Long duration to give user time to decide
                        });
                      }
                    }, 2000);
                    
                    // Reset scan states - but with a slight delay to avoid abrupt transition
                    setTimeout(() => {
                      setIsScanning(false);
                      setCapturedPhoto(false);
                      // Reset scan progress for next time
                      setScanProgress(0);
                    }, 500);
                  }, 3500);
                }, 1000);
              }, 4500);
            }, 5000);
          }, 4000);
        }, 2500);
      } else {
        // If photo capture failed
        toast({
          title: "Capture Failed",
          description: "Unable to take photo. Please try again.",
          variant: "destructive",
        });
        // Clear the progress interval
        clearInterval(progressInterval);
        // Reset scan progress
        setScanProgress(0);
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
                        {/* Camera flash animation - enhanced with stronger flash effect */}
                        <div className="absolute inset-0 bg-white opacity-0 animate-camera-flash z-50" />
                        
                        {/* Scanning progress bar */}
                        <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-gradient-to-t from-black/70 to-transparent">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-white">AI Analysis</span>
                            <span className="text-xs font-medium text-white">{scanProgress}%</span>
                          </div>
                          <Progress value={scanProgress} className="h-2" />
                        </div>
                        
                        {/* Photo captured freeze frame overlay */}
                        {capturedPhoto && (
                          <>
                            {/* Show the actual captured photo instead of the live video feed - enhanced for better visibility */}
                            {capturedPhotoUrl && (
                              <div className="absolute inset-0 z-40">
                                {/* Slight shadow around the edges to make the frozen frame stand out */}
                                <div className="absolute inset-0 shadow-inner pointer-events-none"></div>
                                
                                <img 
                                  src={capturedPhotoUrl} 
                                  alt="Captured product" 
                                  className="w-full h-full object-cover"
                                />
                                
                                {/* Subtle overlay to make detection boxes more visible */}
                                <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-black/10 via-transparent to-black/5"></div>
                                
                                {/* Add AI detection boxes over the frozen image */}
                                <div className="absolute inset-0">
                                  {/* Main product detection box */}
                                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    <div className="h-32 w-32 border-2 border-blue-500 rounded-sm animate-pulse-slow shadow-[0_0_5px_rgba(59,130,246,0.5)]">
                                      {/* Corner markers with enhanced visibility */}
                                      <div className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-blue-500"></div>
                                      <div className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-blue-500"></div>
                                      <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-blue-500"></div>
                                      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-blue-500"></div>
                                      
                                      {/* Target cross in the middle */}
                                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                        <div className="w-6 h-px bg-blue-400 opacity-70"></div>
                                        <div className="h-6 w-px bg-blue-400 opacity-70 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                                      </div>
                                    </div>
                                    <div className="absolute -top-8 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                      <span className="flex items-center whitespace-nowrap">
                                        <span className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></span>
                                        Analyzing product...
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {/* Nutritional info detection - enhanced with animation */}
                                  <div className="absolute bottom-1/4 right-1/4 h-16 w-24 border border-yellow-400 rounded-sm animate-pulse-slow shadow-[0_0_5px_rgba(234,179,8,0.3)]" style={{animationDelay: '0.7s'}}>
                                    <div className="absolute -top-6 left-0 bg-yellow-500 bg-opacity-80 text-white text-xs px-2 py-0.5 rounded shadow-sm">
                                      <span className="flex items-center whitespace-nowrap">
                                        <span className="w-1.5 h-1.5 bg-white rounded-full mr-1 animate-pulse"></span>
                                        Nutrition Facts
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {/* Barcode detection - enhanced with animation */}
                                  <div className="absolute top-2/3 left-1/4 h-10 w-16 border border-green-400 rounded-sm animate-pulse-slow shadow-[0_0_5px_rgba(74,222,128,0.3)]" style={{animationDelay: '1.2s'}}>
                                    <div className="absolute -top-6 left-0 bg-green-500 bg-opacity-80 text-white text-xs px-2 py-0.5 rounded shadow-sm">
                                      <span className="flex items-center whitespace-nowrap">
                                        <span className="w-1.5 h-1.5 bg-white rounded-full mr-1 animate-pulse"></span>
                                        UPC Code
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {/* Brand detection area - new addition */}
                                  <div className="absolute top-1/4 right-1/3 h-8 w-20 border border-purple-400 rounded-sm animate-pulse-slow shadow-[0_0_5px_rgba(192,132,252,0.3)]" style={{animationDelay: '1.8s'}}>
                                    <div className="absolute -top-6 right-0 bg-purple-500 bg-opacity-80 text-white text-xs px-2 py-0.5 rounded shadow-sm">
                                      <span className="flex items-center whitespace-nowrap">
                                        <span className="w-1.5 h-1.5 bg-white rounded-full mr-1 animate-pulse"></span>
                                        Brand ID
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
                                <span className="inline-block animate-typing-cursor">{
                                  currentAIState === 'stage1' ? 'Processing image...' :
                                  currentAIState === 'stage2' ? 'Analyzing contents...' :
                                  currentAIState === 'stage3' ? 'Comparing prices...' :
                                  'Finalizing results...'
                                }</span>
                              </div>
                              <div className="text-xs text-white mb-2">
                                {currentAIState === 'stage1' ? 'Detecting object boundaries and labels' :
                                 currentAIState === 'stage2' ? 'Identifying brand, nutrition & pricing' :
                                 currentAIState === 'stage3' ? 'Finding better alternatives for you' :
                                 'Creating personalized recommendations'}
                              </div>
                              <div className="w-40 h-1.5 bg-white bg-opacity-20 rounded-full overflow-hidden">
                                <div className="h-full bg-white animate-progress-linear"></div>
                              </div>
                              
                              {/* AI confidence indicators */}
                              <div className="flex justify-between w-40 mt-1">
                                <span className="text-[10px] text-white opacity-80">Accuracy: {
                                  currentAIState === 'stage1' ? '78%' :
                                  currentAIState === 'stage2' ? '86%' :
                                  currentAIState === 'stage3' ? '92%' :
                                  '97%'
                                }</span>
                                <span className="text-[10px] text-white opacity-80">Model: VisionAI v2.4</span>
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
                              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-1 animate-pulse"></span>
                              Just Scanned
                            </span>
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-blue-700 font-medium mt-1">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center">
                              <span className="material-icons text-sm mr-1">attach_money</span>
                              ${justScanned.price.toFixed(2)} at {justScanned.store}
                            </span>
                            
                            {justScanned.nutritionRating && (
                              <span className="flex items-center text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                <span className="material-icons text-xs mr-1">eco</span>
                                Nutrition: {justScanned.nutritionRating}/5
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-2 text-xs bg-white bg-opacity-70 rounded px-2 py-1 shadow-sm">
                          {/* Technical analysis results */}
                          <div className="flex items-center justify-between border-b border-gray-100 pb-1 mb-1">
                            <span className="flex items-center text-blue-700">
                              <span className="material-icons text-xs mr-1 text-blue-500">check_circle</span>
                              Product identified with 97% confidence
                            </span>
                            <span className="text-gray-500 text-[10px]">{new Date().toLocaleTimeString()}</span>
                          </div>
                          
                          {/* Product details verified */}
                          <div className="flex items-center text-amber-700">
                            <span className="material-icons text-xs mr-1 text-amber-500">verified</span>
                            UPC {justScanned.barcode} verified
                          </div>
                          
                          {/* Categories */}
                          {justScanned.categories && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {justScanned.categories.map((category: string, i: number) => (
                                <span key={i} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-sm">{category}</span>
                              ))}
                            </div>
                          )}
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Recent Transactions</CardTitle>
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">Last 14 days</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="max-h-[300px] overflow-y-auto pr-2">
                    <div className="space-y-3">
                      {/* Most recent transactions first */}
                      <div className="flex items-center p-3 border border-neutral-100 rounded-lg bg-white">
                        <div className="bg-blue-50 rounded-full p-2 mr-3">
                          <span className="material-icons text-blue-500">store</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Whole Foods Market</div>
                          <div className="flex text-xs text-neutral-500 justify-between">
                            <span>March 25, 2025 • 4:22 PM</span>
                            <span className="font-medium text-neutral-700">$78.34</span>
                          </div>
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-sm">Produce</span>
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-sm">Snacks</span>
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-sm">Dairy</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center p-3 border border-neutral-100 rounded-lg bg-white">
                        <div className="bg-red-50 rounded-full p-2 mr-3">
                          <span className="material-icons text-red-500">store</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Target</div>
                          <div className="flex text-xs text-neutral-500 justify-between">
                            <span>March 23, 2025 • 9:35 AM</span>
                            <span className="font-medium text-neutral-700">$42.18</span>
                          </div>
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            <span className="text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded-sm">Household</span>
                            <span className="text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded-sm">Groceries</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center p-3 border border-neutral-100 rounded-lg bg-white">
                        <div className="bg-amber-50 rounded-full p-2 mr-3">
                          <span className="material-icons text-amber-500">store</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Kroger</div>
                          <div className="flex text-xs text-neutral-500 justify-between">
                            <span>March 18, 2025 • 6:12 PM</span>
                            <span className="font-medium text-neutral-700">$63.56</span>
                          </div>
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-sm">Meat</span>
                            <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-sm">Produce</span>
                            <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-sm">Pantry</span>
                          </div>
                          <div className="mt-1.5 text-xs text-green-600 flex items-center">
                            <span className="material-icons text-[12px] mr-1">savings</span>
                            Saved $12.47 with Smart Swaps
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center p-3 border border-neutral-100 rounded-lg bg-white">
                        <div className="bg-blue-50 rounded-full p-2 mr-3">
                          <span className="material-icons text-blue-500">store</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Walmart</div>
                          <div className="flex text-xs text-neutral-500 justify-between">
                            <span>March 15, 2025 • 10:45 AM</span>
                            <span className="font-medium text-neutral-700">$94.23</span>
                          </div>
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-sm">Groceries</span>
                            <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-sm">Electronics</span>
                            <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-sm">Household</span>
                          </div>
                          <div className="mt-1.5 text-xs text-green-600 flex items-center">
                            <span className="material-icons text-[12px] mr-1">savings</span>
                            Saved $5.32 with Smart Swaps
                          </div>
                        </div>
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
                        <div className="p-2 bg-blue-100 rounded-full mr-3">
                          <span className="material-icons text-blue-600">lightbulb</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-neutral-900">Scan Before You Buy</h4>
                          <p className="text-sm text-neutral-600 mt-1">
                            Always scan items, especially pantry staples like cereal, coffee, and snacks 
                            to find store brand alternatives that can save up to 40%.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="p-2 bg-green-100 rounded-full mr-3">
                          <span className="material-icons text-green-600">schedule</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-neutral-900">Time Your Shopping</h4>
                          <p className="text-sm text-neutral-600 mt-1">
                            Shop on Wednesdays when most stores start their weekly sales, 
                            giving you the best selection of discounted items.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="p-2 bg-amber-100 rounded-full mr-3">
                          <span className="material-icons text-amber-600">local_offer</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-neutral-900">Stack Savings</h4>
                          <p className="text-sm text-neutral-600 mt-1">
                            Combine store loyalty programs with the alternatives we suggest to 
                            maximize your savings on every shopping trip.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
    </div>
  );
}