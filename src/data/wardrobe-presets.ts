import { WardrobePreset } from "@/types/wardrobe";

export const wardrobePresets: WardrobePreset[] = [
  {
    id: "mexican-guayabera",
    name: "Mexican Guayabera",
    styleLabel: "heritage linen shirt",
    description: "Traditional lightweight linen shirt with embroidery.",
    previewUri:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200",
    referenceUri:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200",
    promptFragment:
      "Apply the Mexican Guayabera outfit from the reference image while preserving the person's identity, face, hairstyle and pose. Keep realistic lighting and fabric folds.",
    tint: "#B98C62",
  },

  {
    id: "relaxed-ripped-denim",
    name: "Relaxed Ripped Denim",
    styleLabel: "distressed denim look",
    description: "Relaxed ripped jeans with an oversized tee.",
    previewUri:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200",
    referenceUri:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200",
    promptFragment:
      "Dress the subject in relaxed ripped denim jeans with a loose neutral t-shirt. Maintain the original face and body proportions.",
    tint: "#607D8B",
  },

  {
    id: "city-smart-casual",
    name: "City Smart Casual",
    styleLabel: "minimal everyday outfit",
    description: "Modern smart casual outfit for urban lifestyle.",
    previewUri:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1200",
    referenceUri:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1200",
    promptFragment:
      "Replace the clothing with a beige overshirt, white tee, tailored chinos and white sneakers while keeping the person's identity unchanged.",
    tint: "#D4B483",
  },

  {
    id: "old-money",
    name: "Old Money",
    styleLabel: "luxury classic",
    description: "Elegant timeless luxury fashion.",
    previewUri:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200",
    referenceUri:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200",
    promptFragment:
      "Style the subject in an old money aesthetic with cream trousers, navy blazer and loafers while preserving facial features.",
    tint: "#A8906D",
  },

  {
    id: "quiet-luxury",
    name: "Quiet Luxury",
    styleLabel: "premium minimal",
    description: "Soft neutral tones with premium fabrics.",
    previewUri:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200",
    referenceUri:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200",
    promptFragment:
      "Dress the subject in premium beige knitwear with tailored pants and luxury minimalist styling.",
    tint: "#CAB89C",
  },

  {
    id: "streetwear-black",
    name: "Streetwear Black",
    styleLabel: "oversized streetwear",
    description: "Modern oversized monochrome streetwear.",
    previewUri:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1200",
    referenceUri:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1200",
    promptFragment:
      "Dress the subject in oversized black hoodie, cargo pants and sneakers with realistic shadows.",
    tint: "#2E2E2E",
  },

  {
    id: "summer-linen",
    name: "Summer Linen",
    styleLabel: "vacation outfit",
    description: "Light breathable beachwear.",
    previewUri:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1200",
    referenceUri:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1200",
    promptFragment:
      "Dress the person in an ivory linen shirt with beige shorts and sandals suitable for a Mediterranean vacation.",
    tint: "#E2D4BE",
  },

  {
    id: "formal-business",
    name: "Formal Business",
    styleLabel: "executive suit",
    description: "Professional business attire.",
    previewUri:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200",
    referenceUri:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200",
    promptFragment:
      "Replace clothing with a charcoal tailored suit, white shirt and navy tie while preserving posture and facial identity.",
    tint: "#4F5965",
  },

  {
    id: "winter-layered",
    name: "Winter Layered",
    styleLabel: "cold weather fashion",
    description: "Premium winter layering.",
    previewUri:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200",
    referenceUri:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200",
    promptFragment:
      "Style the person with a camel wool coat, knit sweater, scarf and dark jeans in realistic winter fashion.",
    tint: "#8C6B50",
  },

  {
    id: "athleisure",
    name: "Athleisure",
    styleLabel: "sport luxury",
    description: "Comfortable premium activewear.",
    previewUri:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200",
    referenceUri:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200",
    promptFragment:
      "Dress the subject in premium athletic wear including fitted joggers, performance hoodie and running shoes.",
    tint: "#6D8C78",
  },

  // ==========================
// MEN COLLECTION
// ==========================

{
  id: "korean-casual",
  name: "Korean Casual",
  styleLabel: "minimal korean fashion",
  description: "Relaxed oversized Korean street style.",
  previewUri: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the subject in a modern Korean oversized shirt, wide trousers, and white sneakers while preserving identity and pose.",
  tint: "#8E9AAF",
},

{
  id: "techwear",
  name: "Techwear",
  styleLabel: "urban futuristic",
  description: "Modern tactical techwear outfit.",
  previewUri: "https://images.unsplash.com/photo-1506629905607-d9c297d3b1d1?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1506629905607-d9c297d3b1d1?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the subject in black tactical techwear with utility pockets, combat boots, and futuristic styling.",
  tint: "#2D2D2D",
},

{
  id: "smart-casual",
  name: "Smart Casual",
  styleLabel: "clean everyday",
  description: "Elegant everyday smart casual.",
  previewUri: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Replace clothing with chinos, white shirt and lightweight blazer while maintaining the original face.",
  tint: "#C6A77D",
},

{
  id: "denim-layered",
  name: "Denim Layered",
  styleLabel: "modern denim",
  description: "Layered denim jacket outfit.",
  previewUri: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Apply a layered denim jacket over a plain tee with slim jeans and sneakers.",
  tint: "#5E81AC",
},

{
  id: "gym-athlete",
  name: "Gym Athlete",
  styleLabel: "fitness wear",
  description: "Performance athletic outfit.",
  previewUri: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the subject in premium gym wear including fitted performance t-shirt, joggers and trainers.",
  tint: "#4CAF50",
},

{
  id: "luxury-black",
  name: "Luxury Black",
  styleLabel: "premium monochrome",
  description: "Luxury all-black outfit.",
  previewUri: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Replace clothing with premium black turtleneck, tailored trousers and Chelsea boots.",
  tint: "#212121",
},

{
  id: "beach-vacation",
  name: "Beach Vacation",
  styleLabel: "summer getaway",
  description: "Relaxed beach outfit.",
  previewUri: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the person in a tropical vacation shirt, linen shorts and sandals.",
  tint: "#F4C95D",
},

{
  id: "classic-gentleman",
  name: "Classic Gentleman",
  styleLabel: "timeless elegance",
  description: "Vintage gentleman style.",
  previewUri: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Apply a classic gentleman outfit featuring a three-piece suit, pocket square and leather shoes.",
  tint: "#7D5A50",
},

{
  id: "college-style",
  name: "College Style",
  styleLabel: "campus casual",
  description: "Youthful campus fashion.",
  previewUri: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the subject in a varsity jacket, jeans and sneakers suitable for a college student.",
  tint: "#4E79A7",
},

{
  id: "business-casual",
  name: "Business Casual",
  styleLabel: "office smart",
  description: "Professional office outfit.",
  previewUri: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Replace clothing with a business casual outfit including chinos, oxford shirt and blazer.",
  tint: "#6D6875",
},

// ==========================
// WOMEN COLLECTION
// ==========================

{
  id: "office-chic",
  name: "Office Chic",
  styleLabel: "professional elegance",
  description: "Modern office wear with a sophisticated touch.",
  previewUri: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the subject in an elegant office outfit with a fitted blazer, pencil trousers and heels while preserving identity.",
  tint: "#8C7B75",
},

{
  id: "coquette",
  name: "Coquette",
  styleLabel: "soft feminine",
  description: "Romantic bows and pastel aesthetics.",
  previewUri: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Apply a coquette-inspired outfit featuring soft pink colors, ribbons and elegant accessories.",
  tint: "#F4B6C2",
},

{
  id: "cottagecore",
  name: "Cottagecore",
  styleLabel: "vintage countryside",
  description: "Flowy dresses inspired by nature.",
  previewUri: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the subject in a floral cottagecore dress with earthy tones and vintage styling.",
  tint: "#A3B18A",
},

{
  id: "party-glam",
  name: "Party Glam",
  styleLabel: "luxury evening",
  description: "Elegant evening party outfit.",
  previewUri: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the subject in a glamorous evening gown with luxury accessories.",
  tint: "#9C27B0",
},

{
  id: "minimal-beige",
  name: "Minimal Beige",
  styleLabel: "neutral luxury",
  description: "Minimal monochrome fashion.",
  previewUri: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Replace clothing with premium beige knitwear and tailored wide-leg pants.",
  tint: "#D9C5A0",
},

{
  id: "korean-girl",
  name: "Korean Girl",
  styleLabel: "k-fashion",
  description: "Modern Korean casual outfit.",
  previewUri: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the subject in trendy Korean fashion with oversized cardigan and pleated skirt.",
  tint: "#A7C7E7",
},

{
  id: "old-money-woman",
  name: "Old Money Woman",
  styleLabel: "luxury heritage",
  description: "Classic old money women's fashion.",
  previewUri: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the subject in an elegant cream blazer, silk blouse and tailored trousers.",
  tint: "#CDB79E",
},

{
  id: "summer-floral",
  name: "Summer Floral",
  styleLabel: "vacation dress",
  description: "Light floral summer dress.",
  previewUri: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the subject in a floral midi dress with sandals suitable for summer vacations.",
  tint: "#F2C6DE",
},

{
  id: "winter-coat-woman",
  name: "Winter Coat",
  styleLabel: "cozy winter",
  description: "Premium winter layering.",
  previewUri: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the subject in a camel overcoat, scarf and leather boots.",
  tint: "#8D6E63",
},

{
  id: "street-style-girl",
  name: "Street Style",
  styleLabel: "urban fashion",
  description: "Modern oversized street fashion.",
  previewUri: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the subject in oversized hoodie, cargo pants and chunky sneakers.",
  tint: "#546E7A",
},

// ==========================
// KIDS COLLECTION
// ==========================

{
  id: "kids-casual",
  name: "Kids Casual",
  styleLabel: "playful everyday",
  description: "Comfortable colorful everyday clothing for kids.",
  previewUri: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the child in a colorful t-shirt, denim shorts and sneakers while preserving facial identity.",
  tint: "#6EC6FF",
},

{
  id: "kids-school",
  name: "School Uniform",
  styleLabel: "school outfit",
  description: "Classic school uniform for children.",
  previewUri: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the child in a neat school uniform with realistic fabric folds.",
  tint: "#3F51B5",
},

{
  id: "kids-party",
  name: "Birthday Party",
  styleLabel: "celebration",
  description: "Fun birthday party outfit.",
  previewUri: "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the child in a colorful birthday party outfit with festive styling.",
  tint: "#F06292",
},

{
  id: "kids-sports",
  name: "Kids Sports",
  styleLabel: "active wear",
  description: "Comfortable sportswear for kids.",
  previewUri: "https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the child in modern sportswear with sneakers and shorts.",
  tint: "#4CAF50",
},

{
  id: "kids-winter",
  name: "Kids Winter",
  styleLabel: "cozy outfit",
  description: "Warm winter clothing for children.",
  previewUri: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the child in a warm winter jacket, knitted cap and boots.",
  tint: "#90A4AE",
},

// ==========================
// TRADITIONAL COLLECTION
// ==========================

{
  id: "indian-kurta",
  name: "Indian Kurta",
  styleLabel: "traditional indian",
  description: "Elegant Indian kurta with ethnic styling.",
  previewUri: "https://images.unsplash.com/photo-1601056639632-4aa7be3b3e5c?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1601056639632-4aa7be3b3e5c?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the subject in an elegant embroidered Indian kurta with churidar while preserving identity.",
  tint: "#E8B04C",
},

{
  id: "bridal-saree",
  name: "Bridal Saree",
  styleLabel: "traditional elegance",
  description: "Beautiful Indian bridal saree.",
  previewUri: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the subject in a luxurious red bridal saree with gold embroidery and jewelry.",
  tint: "#C62828",
},

{
  id: "japanese-kimono",
  name: "Japanese Kimono",
  styleLabel: "traditional japan",
  description: "Classic Japanese kimono.",
  previewUri: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the subject in a traditional Japanese kimono with authentic styling.",
  tint: "#9C27B0",
},

{
  id: "arabic-thobe",
  name: "Arabic Thobe",
  styleLabel: "middle eastern",
  description: "Traditional Arabic thobe.",
  previewUri: "https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the subject in a white Arabic thobe with traditional accessories.",
  tint: "#ECEFF1",
},

{
  id: "african-dashiki",
  name: "African Dashiki",
  styleLabel: "african heritage",
  description: "Traditional colorful Dashiki attire.",
  previewUri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the subject in a vibrant African Dashiki with traditional patterns.",
  tint: "#FF9800",
},

// ==========================
// TRENDING & VINTAGE COLLECTION
// ==========================

{
  id: "90s-grunge",
  name: "90's Grunge",
  styleLabel: "vintage rock",
  description: "Classic 90's grunge fashion.",
  previewUri: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the subject in a 90's grunge outfit featuring a flannel shirt, ripped jeans and combat boots.",
  tint: "#5D4037",
},

{
  id: "90s-denim",
  name: "90's Denim",
  styleLabel: "retro denim",
  description: "Vintage oversized denim style.",
  previewUri: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Apply an oversized denim jacket, loose jeans and vintage sneakers.",
  tint: "#607D8B",
},

{
  id: "y2k-style",
  name: "Y2K",
  styleLabel: "2000's aesthetic",
  description: "Early 2000's fashion revival.",
  previewUri: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the subject in trendy Y2K fashion with bold accessories and baggy jeans.",
  tint: "#EC407A",
},

{
  id: "clean-girl",
  name: "Clean Girl",
  styleLabel: "minimal luxury",
  description: "Elegant clean girl aesthetic.",
  previewUri: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the subject in clean neutral colors with minimal accessories and luxury basics.",
  tint: "#DCC7AA",
},

{
  id: "clean-boy",
  name: "Clean Boy",
  styleLabel: "modern minimal",
  description: "Simple premium men's style.",
  previewUri: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the subject in premium neutral basics with tailored trousers and white sneakers.",
  tint: "#B0BEC5",
},

{
  id: "kpop-idol",
  name: "K-Pop Idol",
  styleLabel: "idol fashion",
  description: "Modern Korean idol styling.",
  previewUri: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the subject in stylish K-pop inspired stage fashion with layered accessories.",
  tint: "#7E57C2",
},

{
  id: "gothic-style",
  name: "Gothic",
  styleLabel: "dark aesthetic",
  description: "Modern gothic fashion.",
  previewUri: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the subject in an all-black gothic outfit with leather details and boots.",
  tint: "#212121",
},

{
  id: "biker-style",
  name: "Biker",
  styleLabel: "leather rider",
  description: "Classic biker leather outfit.",
  previewUri: "https://images.unsplash.com/photo-1506629905607-d9c297d3b1d1?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1506629905607-d9c297d3b1d1?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the subject in a black leather biker jacket, denim jeans and riding boots.",
  tint: "#424242",
},

{
  id: "sneakerhead",
  name: "Sneakerhead",
  styleLabel: "urban sneakers",
  description: "Modern sneaker culture fashion.",
  previewUri: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the subject in oversized streetwear highlighting premium sneakers.",
  tint: "#5C6BC0",
},

{
  id: "vintage-varsity",
  name: "Vintage Varsity",
  styleLabel: "college retro",
  description: "Retro varsity jacket aesthetic.",
  previewUri: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the subject in a vintage varsity jacket with relaxed denim and sneakers.",
  tint: "#8D6E63",
},

// ==========================
// FORMAL • SPORTS • SEASONAL COLLECTION
// ==========================

{
  id: "wedding-groom",
  name: "Wedding Groom",
  styleLabel: "luxury wedding",
  description: "Premium groom wedding attire.",
  previewUri: "https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the subject in a luxurious wedding tuxedo with bow tie, polished shoes and elegant styling.",
  tint: "#263238",
},

{
  id: "bridal-gown",
  name: "Bridal Gown",
  styleLabel: "wedding elegance",
  description: "Classic white bridal dress.",
  previewUri: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the subject in a luxurious white bridal gown with veil and elegant accessories.",
  tint: "#ECEFF1",
},

{
  id: "black-tuxedo",
  name: "Black Tuxedo",
  styleLabel: "formal luxury",
  description: "Classic black tuxedo.",
  previewUri: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the subject in a tailored black tuxedo with satin lapels and formal shoes.",
  tint: "#212121",
},

{
  id: "resort-luxury",
  name: "Luxury Resort",
  styleLabel: "holiday wear",
  description: "Premium tropical vacation outfit.",
  previewUri: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the subject in luxury resort clothing featuring linen shirt, relaxed shorts and sandals.",
  tint: "#FFD180",
},

{
  id: "trench-coat",
  name: "Trench Coat",
  styleLabel: "timeless outerwear",
  description: "Classic trench coat fashion.",
  previewUri: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the subject in a premium beige trench coat with formal winter styling.",
  tint: "#BCAAA4",
},

{
  id: "snow-explorer",
  name: "Snow Explorer",
  styleLabel: "winter adventure",
  description: "Warm snow-ready outfit.",
  previewUri: "https://images.unsplash.com/photo-1517298257259-f72ccd2db392?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1517298257259-f72ccd2db392?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the subject in insulated winter clothing with boots, gloves and snow jacket.",
  tint: "#90CAF9",
},

{
  id: "football-kit",
  name: "Football Kit",
  styleLabel: "sportswear",
  description: "Professional football jersey.",
  previewUri: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the subject in a professional football jersey, shorts and football boots.",
  tint: "#43A047",
},

{
  id: "basketball-kit",
  name: "Basketball Kit",
  styleLabel: "court ready",
  description: "Professional basketball outfit.",
  previewUri: "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the subject in a basketball jersey, shorts and high-top sneakers.",
  tint: "#FB8C00",
},

{
  id: "gym-pro",
  name: "Gym Pro",
  styleLabel: "fitness performance",
  description: "Premium gym performance wear.",
  previewUri: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the subject in modern compression gym wear with performance shoes and athletic styling.",
  tint: "#66BB6A",
},

{
  id: "motorcycle-rider",
  name: "Motorcycle Rider",
  styleLabel: "racing style",
  description: "Professional motorcycle riding gear.",
  previewUri: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80",
  referenceUri: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80",
  promptFragment:
    "Dress the subject in professional motorcycle racing gear with helmet and leather suit.",
  tint: "#37474F",
},

];

export function getWardrobePreset(presetId?: string) {
  return wardrobePresets.find((preset) => preset.id === presetId);
}
