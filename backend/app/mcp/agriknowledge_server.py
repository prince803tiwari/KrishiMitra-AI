from typing import Dict, Any, List

CROP_DB = {
    "kharif": {
        "clayey": ["Rice", "Soybean", "Sorghum"],
        "loamy": ["Maize", "Cotton", "Sugarcane", "Groundnut"],
        "sandy": ["Pearl Millet (Bajra)", "Sesame", "Cowpea"],
        "black": ["Cotton", "Soybean", "Pigeon Pea (Tur)"]
    },
    "rabi": {
        "clayey": ["Wheat", "Gram (Chickpea)", "Linseed"],
        "loamy": ["Wheat", "Mustard", "Barley", "Peas"],
        "sandy": ["Mustard", "Barley", "Potato (requires heavy irrigation)"],
        "black": ["Wheat", "Safflower", "Bengal Gram"]
    },
    "zaid": {
        "loamy": ["Watermelon", "Cucumber", "Muskmelon", "Pumpkin"],
        "sandy": ["Watermelon", "Bitter gourd", "Bottle gourd"],
        "clayey": ["Moong Bean", "Cowpea"]
    }
}

FERTILIZER_DB = {
    "rice": {
        "npk_ratio": "120:60:60 (N:P2O5:K2O) kg/ha",
        "instructions": "Apply full dose of Phosphorus (P) and Potassium (K) at the time of puddling/sowing. Split Nitrogen (N) into three doses: 50% at transplanting, 25% at tillering, and 25% at panicle initiation.",
        "organic_alternatives": "Incorporate Farm Yard Manure (FYM) at 10-15 tonnes/ha or grow Sesbania (green manure) prior to rice cultivation."
    },
    "wheat": {
        "npk_ratio": "120:60:40 (N:P2O5:K2O) kg/ha",
        "instructions": "Apply half of Nitrogen and full doses of P and K at sowing. Apply the remaining half of Nitrogen at the first irrigation (Crown Root Initiation stage, ~21 days after sowing).",
        "organic_alternatives": "Vermicompost at 5 tonnes/ha combined with Azotobacter and PSB (Phosphate Solubilizing Bacteria) seed inoculation."
    },
    "maize": {
        "npk_ratio": "150:75:50 (N:P2O5:K2O) kg/ha",
        "instructions": "Apply 10% N and full P & K at sowing. Split the rest of N at knee-high stage (40%) and tasseling stage (50%).",
        "organic_alternatives": "Composted poultry manure at 3 tonnes/ha."
    },
    "cotton": {
        "npk_ratio": "100:50:50 (N:P2O5:K2O) kg/ha",
        "instructions": "For rainfed cotton, apply P & K at sowing. Split Nitrogen into two equal doses at 30 and 60 days after sowing. For irrigated cotton, split into three doses.",
        "organic_alternatives": "Castor cake or Neem cake at 500 kg/ha to supply nitrogen and act as a pest repellent."
    },
    "mustard": {
        "npk_ratio": "80:40:40 (N:P2O5:K2O) kg/ha",
        "instructions": "Apply full P, K and half N at sowing. Top dress remaining N at first irrigation (30 days after sowing). Mustard also requires Sulphur (S) at 20-40 kg/ha.",
        "organic_alternatives": "Gypsum application at 250 kg/ha to fulfill Sulphur requirements, combined with organic compost."
    }
}

PEST_DB = {
    "rice": [
        {
            "symptom_keyword": "stem borer",
            "pest_name": "Yellow Stem Borer",
            "symptoms": "Dead hearts (drying of central tiller) in vegetative stage, Whiteheads (empty white panicles) in reproductive stage.",
            "organic_control": "Install pheromone traps @ 5/acre. Release Trichogramma japonicum egg parasitoid @ 20,000/acre at weekly intervals.",
            "chemical_control": "Spray Cartap Hydrochloride 50 SP @ 400g/acre or Chlorantraniliprole 18.5 SC @ 60ml/acre."
        },
        {
            "symptom_keyword": "leaf folder",
            "pest_name": "Rice Leaf Folder",
            "symptoms": "Leaves folded longitudinally with white transparent scrapes of chlorophyll fed on by larvae.",
            "organic_control": "Use a rope across the crop to dislodge larvae. Release Trichogramma chilonis @ 20,000/acre.",
            "chemical_control": "Spray Flubendiamide 39.35 SC @ 20ml/acre or Fipronil 5 SC @ 400ml/acre."
        }
    ],
    "tomato": [
        {
            "symptom_keyword": "early blight",
            "pest_name": "Early Blight (Fungus: Alternaria solani)",
            "symptoms": "Concentric rings (target board effect) starting on older lower leaves, leaf yellowing and defoliation.",
            "organic_control": "Spray Neem oil (1%) or Trichoderma viride @ 5g/litre. Maintain crop rotation and remove lower infected leaves.",
            "chemical_control": "Spray Mancozeb @ 2.5g/litre or Copper Oxychloride @ 3g/litre of water."
        },
        {
            "symptom_keyword": "fruit borer",
            "pest_name": "Tomato Fruit Borer (Helicoverpa armigera)",
            "symptoms": "Larvae boring holes into fruits, making them unfit for consumption and prone to secondary rot.",
            "organic_control": "Plant African Marigold as a trap crop (1 row of marigold for 16 rows of tomato). Spray Bacillus thuringiensis (Bt) @ 2g/litre.",
            "chemical_control": "Spray Chlorantraniliprole 18.5 SC @ 60ml/acre or Indoxacarb 14.5 SC @ 200ml/acre."
        }
    ],
    "wheat": [
        {
            "symptom_keyword": "rust",
            "pest_name": "Yellow Rust / Stripe Rust (Fungus: Puccinia striiformis)",
            "symptoms": "Yellowish-orange pustules arranged in linear stripes on leaf surfaces. Bright yellow powder rubs off on fingers.",
            "organic_control": "Grow resistant cultivars (e.g. HD 2967, HD 3086). Apply biodynamic compost and vermiwash spray.",
            "chemical_control": "Spray Propiconazole 25 EC @ 200ml/acre in 200 litres of water immediately upon symptom detection."
        }
    ]
}

def crop_recommendation(soil_type: str, season: str, region: str) -> Dict[str, Any]:
    """
    Recommend suitable crops based on soil type, agricultural season, and geographical region.
    
    Args:
        soil_type: Type of soil ('clayey', 'loamy', 'sandy', 'black').
        season: Agricultural season ('kharif', 'rabi', 'zaid').
        region: Region or state in India (e.g., 'punjab', 'maharashtra', 'bihar').
    """
    soil_clean = soil_type.lower().strip()
    season_clean = season.lower().strip()
    region_clean = region.lower().strip()
    
    # Simple check on season database
    season_data = CROP_DB.get(season_clean, {})
    crops = season_data.get(soil_clean, [])
    
    if not crops:
        # Fallbacks
        if "black" in soil_clean or "regur" in soil_clean:
            crops = ["Cotton", "Soybean", "Gram"]
        elif "sandy" in soil_clean:
            crops = ["Mustard", "Bajra", "Groundnut"]
        else:
            crops = ["Wheat", "Rice", "Maize"]
            
    # Tailor based on region
    region_notes = ""
    if "punjab" in region_clean or "haryana" in region_clean:
        region_notes = "Highly suitable for intensive wheat-rice rotation. Keep check on groundwater depletion."
    elif "maharashtra" in region_clean or "gujarat" in region_clean or "deccan" in region_clean:
        region_notes = "Excellent for cotton (Kapaskhedi) and oilseeds on black soils. Drip irrigation is highly recommended."
    elif "bihar" in region_clean or "bengal" in region_clean:
        region_notes = "Ideal for alluvial clay-loam crops. Double-cropping rice with winter pulses/maize is productive."
    else:
        region_notes = "Generic recommendation. Ensure soil health cards are updated annually."
        
    return {
        "season": season,
        "soil_type": soil_type,
        "region": region,
        "recommended_crops": crops,
        "regional_advisory": region_notes,
        "water_requirement": "High" if "rice" in [c.lower() for c in crops] or "sugarcane" in [c.lower() for c in crops] else "Moderate"
    }

def fertilizer_recommendation(crop_name: str, soil_type: str) -> Dict[str, Any]:
    """
    Recommend chemical and organic fertilizers for a crop given the soil type.
    
    Args:
        crop_name: Name of the crop (e.g. 'wheat', 'rice', 'mustard').
        soil_type: Soil type ('clayey', 'loamy', 'sandy', 'black').
    """
    crop_clean = crop_name.lower().strip()
    soil_clean = soil_type.lower().strip()
    
    fertilizer = FERTILIZER_DB.get(crop_clean)
    if not fertilizer:
        # Simple generic recommendations
        return {
            "crop": crop_name,
            "soil_type": soil_type,
            "npk_ratio": "80:40:20 (N:P2O5:K2O) kg/ha (Estimated)",
            "instructions": "General recommendation: Apply 50% N and full P & K at sowing. Top dress remaining N after 30 days.",
            "organic_alternatives": "Apply 10 tonnes of decomposed compost/manure per hectare at land preparation."
        }
        
    # Tweak if sandy soil (requires more potassium and organic matter to hold nutrients)
    npk = fertilizer["npk_ratio"]
    instructions = fertilizer["instructions"]
    organic = fertilizer["organic_alternatives"]
    
    if "sandy" in soil_clean:
        npk = npk.replace("K2O) kg/ha", "K2O) kg/ha + 20kg additional K for light soils")
        instructions += " Note: For sandy soils, split Potassium application into two doses to prevent leaching."
        organic += " Crucial: Sandy soils require high organic matter. Double the FYM/compost application."
        
    return {
        "crop": crop_name,
        "soil_type": soil_type,
        "npk_ratio": npk,
        "instructions": instructions,
        "organic_alternatives": organic
    }

def pest_management(crop_name: str, symptom: str) -> Dict[str, Any]:
    """
    Identify possible pests and disease management options from symptoms.
    
    Args:
        crop_name: Name of the crop.
        symptom: Farmer described symptoms (e.g. 'yellow stripe', 'bored holes', 'leaf folder').
    """
    crop_clean = crop_name.lower().strip()
    symptom_clean = symptom.lower().strip()
    
    pests = PEST_DB.get(crop_clean, [])
    matched_pest = None
    
    for p in pests:
        if p["symptom_keyword"] in symptom_clean or any(word in symptom_clean for word in p["symptoms"].lower().split()):
            matched_pest = p
            break
            
    if not matched_pest:
        # Provide general treatment
        return {
            "crop": crop_name,
            "symptom": symptom,
            "diagnosed_issue": "Fungal Infection or Micronutrient Deficiency (Suspected)",
            "organic_remedy": "Spray Neem seed kernel extract (NSKE 5%) or spray Panchagavya/vermiwash as a general booster.",
            "chemical_remedy": "Apply general Mancozeb 75 WP fungicide (2g/litre) if spots are spreading, or spray micro-nutrient mix.",
            "prevention": "Ensure proper field sanitation, crop rotation, and avoid overhead watering."
        }
        
    return {
        "crop": crop_name,
        "symptom": symptom,
        "diagnosed_issue": matched_pest["pest_name"],
        "symptoms_recorded": matched_pest["symptoms"],
        "organic_remedy": matched_pest["organic_control"],
        "chemical_remedy": matched_pest["chemical_control"],
        "prevention": "Use clean seeds, perform seed treatment with Trichoderma, and monitor crop weekly."
    }

# FastAPI / MCP integration structure
try:
    from fastmcp import FastMCP
    mcp = FastMCP("Agriculture Knowledge MCP Server")
    mcp.tool()(crop_recommendation)
    mcp.tool()(fertilizer_recommendation)
    mcp.tool()(pest_management)
except ImportError:
    pass
