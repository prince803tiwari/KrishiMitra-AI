from typing import Dict, Any, List

SCHEMES_DB = [
    {
        "id": "pm_kisan",
        "name": "PM-Kisan Samman Nidhi",
        "category": "Income Support",
        "benefits": "Rs. 6,000 per year in three equal installments of Rs. 2,000 directly to bank accounts.",
        "eligibility_summary": "All landholding farmer families across the country (subject to certain exclusion criteria like taxpayers, institutional landholders).",
        "rules": {
            "max_land_size_ha": 999.0,  # No size limit now, landholding is the main criteria
            "requires_land": True,
            "exclusion_keywords": ["taxpayer", "government employee", "professional", "pensioner_above_10000"]
        },
        "application_process": "Apply on the PM-Kisan Portal (pmkisan.gov.in) with Aadhaar, Land Record Documents, Bank Account Details, and Mobile Number."
    },
    {
        "id": "pmfby",
        "name": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        "category": "Crop Insurance",
        "benefits": "Financial support to farmers suffering crop loss/damage due to unforeseen events. Premium is heavily subsidized: 2% for Kharif, 1.5% for Rabi, 5% for commercial/horticultural crops.",
        "eligibility_summary": "All farmers including sharecroppers and tenant farmers growing notified crops in notified areas.",
        "rules": {
            "max_land_size_ha": 999.0,
            "requires_land": False,  # Tenants are allowed
            "exclusion_keywords": []
        },
        "application_process": "Register via national crop insurance portal or bank branch within 72 hours of sowing/plantation with land record/tenant agreement, sowing certificate, and bank details."
    },
    {
        "id": "kcc",
        "name": "Kisan Credit Card (KCC) Scheme",
        "category": "Credit & Loan",
        "benefits": "Short term credit loans for cultivation, post-harvest expenses, and farm maintenance. Interest rate as low as 4% after prompt repayment incentive.",
        "eligibility_summary": "All farmers - individuals/joint borrowers, owner cultivators, tenant farmers, oral lessees, sharecroppers, and Self Help Groups (SHGs).",
        "rules": {
            "max_land_size_ha": 999.0,
            "requires_land": False,
            "exclusion_keywords": []
        },
        "application_process": "Visit any commercial or rural bank, fill KCC application form, provide land possession documents, identity card, and crop sowing details."
    },
    {
        "id": "pmksy",
        "name": "PM Krishi Sinchayee Yojana (PMKSY) - Per Drop More Crop",
        "category": "Irrigation & Subsidy",
        "benefits": "Subsidy of 55% for small/marginal farmers and 45% for other farmers for installing micro-irrigation systems (Drip and Sprinkler).",
        "eligibility_summary": "Farmers owning agricultural land with access to a water source. Members of cooperative societies and water user associations are also eligible.",
        "rules": {
            "max_land_size_ha": 5.0,  # Subsidy caps often apply for large land sizes
            "requires_land": True,
            "exclusion_keywords": []
        },
        "application_process": "Apply through the state horticulture or agriculture department portal with land ownership details, soil/water testing reports, and a quotation from an approved micro-irrigation supplier."
    },
    {
        "id": "pkvy",
        "name": "Paramparagat Krishi Vikas Yojana (PKVY)",
        "category": "Organic Farming",
        "benefits": "Financial assistance of Rs. 50,000 per hectare for 3 years, of which 62% (Rs. 31,000) is given as incentive for organic inputs (seeds, bio-fertilizers, composting).",
        "eligibility_summary": "Farmers willing to form groups or clusters of 50 or more farmers, covering 50 acres of land, to adopt organic farming.",
        "rules": {
            "max_land_size_ha": 2.0,  # Cap per individual farmer in a cluster
            "requires_land": True,
            "exclusion_keywords": []
        },
        "application_process": "Form a cluster with neighboring farmers and apply to the local district agriculture officer or register under the Participatory Guarantee System (PGS-India) portal."
    }
]

def search_scheme(query: str) -> List[Dict[str, Any]]:
    """
    Search for government schemes matching keywords.
    
    Args:
        query: Search term (e.g. 'insurance', 'subsidy', 'loan').
    """
    query_clean = query.lower().strip()
    if not query_clean:
        return SCHEMES_DB
        
    matches = []
    for s in SCHEMES_DB:
        if (query_clean in s["name"].lower() or 
            query_clean in s["category"].lower() or 
            query_clean in s["benefits"].lower() or
            query_clean in s["eligibility_summary"].lower()):
            matches.append(s)
            
    return matches

def eligibility_checker(scheme_name: str, farmer_details: Dict[str, Any]) -> Dict[str, Any]:
    """
    Checks if a farmer is eligible for a specific scheme based on their details.
    
    Args:
        scheme_name: The name or ID of the scheme.
        farmer_details: A dictionary containing details like:
            - land_size_ha (float)
            - owns_land (bool)
            - is_taxpayer (bool)
            - job_type (str, e.g., 'farmer', 'government', 'retired')
            - group_farming (bool)
    """
    # Resolve scheme
    scheme = None
    scheme_clean = scheme_name.lower()
    for s in SCHEMES_DB:
        if scheme_clean in s["name"].lower() or scheme_clean == s["id"]:
            scheme = s
            break
            
    if not scheme:
        return {
            "eligible": False,
            "reason": f"Scheme '{scheme_name}' not found. Please try searching for the scheme first.",
            "recommendation": "Search for available schemes using search_scheme tool."
        }
        
    rules = scheme["rules"]
    
    # Extract details with defaults
    land_size = float(farmer_details.get("land_size_ha", 0.0))
    owns_land = bool(farmer_details.get("owns_land", True))
    is_taxpayer = bool(farmer_details.get("is_taxpayer", False))
    job_type = str(farmer_details.get("job_type", "farmer")).lower()
    group_farming = bool(farmer_details.get("group_farming", False))
    
    # 1. Landownership check
    if rules["requires_land"] and not owns_land:
        return {
            "scheme": scheme["name"],
            "eligible": False,
            "reason": "This scheme is exclusively for landholders. Since you do not own land, you are not eligible.",
            "recommendation": "Consider other schemes that allow tenant farmers, such as the Kisan Credit Card (KCC) or PMFBY."
        }
        
    # 2. Land size check
    if land_size > rules["max_land_size_ha"]:
        return {
            "scheme": scheme["name"],
            "eligible": False,
            "reason": f"Your land size ({land_size} ha) exceeds the limit of {rules['max_land_size_ha']} ha for this scheme.",
            "recommendation": "Consult the local agriculture extension officer to see if individual exemptions apply."
        }
        
    # 3. Taxpayer / Exclusion criteria
    if "taxpayer" in rules["exclusion_keywords"] and is_taxpayer:
        return {
            "scheme": scheme["name"],
            "eligible": False,
            "reason": "Institutional landowners and active income-tax payers are excluded from PM-Kisan.",
            "recommendation": "Look into credit-related programs like KCC, which do not exclude taxpayers."
        }
        
    # 4. Job type exclusion
    if job_type in ["government", "doctor", "lawyer", "engineer"]:
        return {
            "scheme": scheme["name"],
            "eligible": False,
            "reason": "Government employees and registered professionals are excluded from receiving direct financial aid under PM-Kisan.",
            "recommendation": "Seek support under technical subsidies (like PMKSY) where professional criteria are different."
        }
        
    # 5. Organic cluster requirement
    if scheme["id"] == "pkvy" and not group_farming and land_size < 20.0:
        return {
            "scheme": scheme["name"],
            "eligible": "Conditional",
            "reason": "PKVY is a cluster-based scheme. You are eligible if you join or form a cluster of at least 50 farmers or cover 50 acres of land.",
            "recommendation": "Approach your block agricultural extension officer to get mapped into an existing organic cluster in your district."
        }
        
    # Passed all checks
    return {
        "scheme": scheme["name"],
        "eligible": True,
        "reason": "Congratulations! You meet the primary criteria for this scheme.",
        "benefits": scheme["benefits"],
        "application_process": scheme["application_process"]
    }

# FastAPI / MCP integration structure
try:
    from fastmcp import FastMCP
    mcp = FastMCP("Government Scheme MCP Server")
    mcp.tool()(search_scheme)
    mcp.tool()(eligibility_checker)
except ImportError:
    pass
