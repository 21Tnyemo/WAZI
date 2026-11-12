/* Wazi — verification dataset (illustrative demo data, not real registry results).
   Regions: Dar es Salaam, Dodoma, Kilimanjaro, Arusha, Mwanza. */
window.WAZI_DATA = [
  {
    id:"P124", plot:"Plot 124, Block C", area:"Mbezi Beach", district:"Kinondoni", region:"Dar es Salaam",
    listing:"DSM-124C", deed:"TD-72-19845", size:800, landUse:"Residential",
    owner:{name:"Amani J. Mushi", type:"Owner"},
    seller:{name:"Makao Bora Agents", trust:4.6, listings:38},
    price:{asking:160000000, perSqm:200000, low:170000, high:240000, comps:7},
    checks:{
      owner:{s:"Verified",src:"Ministry of Lands extract",date:"2026-10-18"},
      titleDeed:{s:"Verified",src:"Registry extract",date:"2026-10-18"},
      survey:{s:"Verified",src:"Survey plan on file",date:"2025-07-02"},
      disputes:{s:"Verified",src:"Court & tribunal records",date:"2026-10-18"},
      landUse:{s:"Verified",src:"Zoning record",date:"2026-09-30"}
    },
    flags:[], map:{poly:"120,60 270,70 280,170 130,180", pin:"200,120", gps:"-6.735, 39.218"},
    facts:{tenure:"Right of Occupancy (99 yrs)", registered:"2011-04-12", ward:"Mbezi Beach", plotNo:"124/C"},
    docs:["Certificate of Title (certified copy)","Survey plan","Land rent receipt","Seller ID (NIDA)"]
  },
  {
    id:"P7", plot:"Plot 7, Block A", area:"Mikocheni", district:"Kinondoni", region:"Dar es Salaam",
    listing:"DSM-07A", deed:"TD-72-33120", size:1000, landUse:"Residential",
    owner:{name:"Grace P. Laizer", type:"Owner (via agent)"},
    seller:{name:"Capital Plots", trust:3.4, listings:21},
    price:{asking:420000000, perSqm:420000, low:260000, high:360000, comps:6},
    checks:{
      owner:{s:"Needs review",src:"Seller acts for owner; power of attorney not uploaded",date:"2026-11-01"},
      titleDeed:{s:"Verified",src:"Registry extract",date:"2026-11-01"},
      survey:{s:"Verified",src:"Survey plan matches plot",date:"2024-11-12"},
      disputes:{s:"Needs review",src:"Bank mortgage recorded",date:"2026-10-29"},
      landUse:{s:"Verified",src:"Zoning record",date:"2026-10-29"}
    },
    flags:["Seller acts for the owner. Power of attorney not uploaded.",
           "Bank mortgage recorded. Ask for the release letter."],
    map:{poly:"110,50 280,60 285,180 120,185", pin:"195,115", gps:"-6.769, 39.260"},
    facts:{tenure:"Right of Occupancy (99 yrs)", registered:"2009-11-03", ward:"Mikocheni", plotNo:"7/A"},
    docs:["Certificate of Title (certified copy)","Survey plan","Land rent receipt","Bank release letter (missing)"]
  },
  {
    id:"P88", plot:"Plot 88", area:"Nzuguni", district:"Dodoma City", region:"Dodoma",
    listing:"DOD-88", deed:"TD-41-10233", size:1200, landUse:"Residential",
    owner:{name:"Juma H. Said", type:"Owner"},
    seller:{name:"Kijiji Realty", trust:4.1, listings:15},
    price:{asking:66000000, perSqm:55000, low:48000, high:72000, comps:5},
    checks:{
      owner:{s:"Verified",src:"Ministry of Lands extract",date:"2026-10-10"},
      titleDeed:{s:"Verified",src:"Registry extract",date:"2026-10-10"},
      survey:{s:"Verified",src:"Survey plan matches plot",date:"2025-03-21"},
      disputes:{s:"Verified",src:"Court & tribunal records",date:"2026-10-10"},
      landUse:{s:"Needs review",src:"Residential confirmed; commercial use needs a permit",date:"2026-10-10"}
    },
    flags:["Residential use confirmed. Commercial use needs a permit."],
    map:{poly:"100,70 260,55 290,160 140,185", pin:"190,120", gps:"-6.158, 35.772"},
    facts:{tenure:"Right of Occupancy (99 yrs)", registered:"2016-06-21", ward:"Nzuguni", plotNo:"88"},
    docs:["Certificate of Title (certified copy)","Survey plan","Land rent receipt"]
  },
  {
    id:"P310", plot:"Plot 310", area:"Ihumwa", district:"Dodoma City", region:"Dodoma",
    listing:"DOD-310", deed:"TD-41-55870", size:2000, landUse:"Agricultural",
    owner:{name:"Neema K. Mbwambo", type:"Owner"},
    seller:{name:"Kibo Land Services", trust:2.6, listings:9},
    price:{asking:30000000, perSqm:15000, low:14000, high:22000, comps:5},
    checks:{
      owner:{s:"Verified",src:"Ministry of Lands extract",date:"2026-09-28"},
      titleDeed:{s:"Needs review",src:"Copy seen. Original not yet confirmed",date:"2026-09-28"},
      survey:{s:"Verified",src:"Survey plan matches plot",date:"2023-08-04"},
      disputes:{s:"Verified",src:"Court & tribunal records",date:"2026-09-28"},
      landUse:{s:"Flagged",src:"Agricultural zoning. Building a home needs a change of use",date:"2026-09-28"}
    },
    flags:["Title deed copy seen. Original not yet confirmed.",
           "Agricultural zoning. Building a home needs a change of use."],
    map:{poly:"90,80 250,60 295,150 150,190", pin:"185,120", gps:"-6.093, 35.826"},
    facts:{tenure:"Customary / granted right", registered:"2018-02-14", ward:"Ihumwa", plotNo:"310"},
    docs:["Title deed (copy only)","Survey plan","Land rent receipt"]
  },
  {
    id:"P14", plot:"Plot 14", area:"Machame", district:"Hai", region:"Kilimanjaro",
    listing:"KIL-14", deed:"TD-55-20901", size:1500, landUse:"Residential",
    owner:{name:"Elia S. Moshi", type:"Owner"},
    seller:{name:"Moshi Homes", trust:3.9, listings:12},
    price:{asking:48000000, perSqm:32000, low:28000, high:44000, comps:6},
    checks:{
      owner:{s:"Flagged",src:"Seller name differs from the record by one name",date:"2026-11-03"},
      titleDeed:{s:"Needs review",src:"Deed number not found in the registry extract",date:"2026-11-03"},
      survey:{s:"Verified",src:"Survey plan matches plot",date:"2024-05-19"},
      disputes:{s:"Flagged",src:"An active boundary dispute is on file",date:"2026-11-03"},
      landUse:{s:"Verified",src:"Zoning record",date:"2026-11-03"}
    },
    flags:["Seller name differs from the record by one name.",
           "Deed number not found in the registry extract.",
           "An active boundary dispute is on file."],
    map:{poly:"110,60 270,75 275,175 120,175", pin:"195,120", gps:"-3.233, 37.265"},
    facts:{tenure:"Right of Occupancy (99 yrs)", registered:"2013-09-30", ward:"Machame", plotNo:"14"},
    docs:["Certificate of Title (unconfirmed)","Survey plan","Land rent receipt (overdue)"]
  },
  {
    id:"P22", plot:"Plot 22", area:"Kiboriloni", district:"Moshi", region:"Kilimanjaro",
    listing:"KIL-22", deed:"TD-55-33415", size:900, landUse:"Residential",
    owner:{name:"Sarah M. Kessy", type:"Owner"},
    seller:{name:"Moshi Homes", trust:3.9, listings:12},
    price:{asking:40500000, perSqm:45000, low:38000, high:58000, comps:5},
    checks:{
      owner:{s:"Verified",src:"Ministry of Lands extract",date:"2026-10-22"},
      titleDeed:{s:"Verified",src:"Registry extract",date:"2026-10-22"},
      survey:{s:"Verified",src:"Survey plan matches plot",date:"2025-01-15"},
      disputes:{s:"Verified",src:"Court & tribunal records",date:"2026-10-22"},
      landUse:{s:"Verified",src:"Zoning record",date:"2026-10-22"}
    },
    flags:[], map:{poly:"120,65 265,60 280,170 130,180", pin:"200,118", gps:"-3.345, 37.360"},
    facts:{tenure:"Right of Occupancy (99 yrs)", registered:"2015-01-08", ward:"Kiboriloni", plotNo:"22"},
    docs:["Certificate of Title (certified copy)","Survey plan","Land rent receipt","Seller ID (NIDA)"]
  },
  {
    id:"P451", plot:"Plot 451, Njiro", area:"Njiro", district:"Arusha City", region:"Arusha",
    listing:"ARU-451", deed:"TD-63-44712", size:1400, landUse:"Residential",
    owner:{name:"Daniel P. Mwaikambo", type:"Owner"},
    seller:{name:"Arusha Property Hub", trust:4.3, listings:27},
    price:{asking:95000000, perSqm:68000, low:55000, high:80000, comps:8},
    checks:{
      owner:{s:"Verified",src:"Ministry of Lands extract",date:"2026-10-30"},
      titleDeed:{s:"Verified",src:"Registry extract",date:"2026-10-30"},
      survey:{s:"Needs review",src:"Survey plan shows a 12 m road reserve overlap",date:"2026-10-30"},
      disputes:{s:"Verified",src:"Court & tribunal records",date:"2026-10-30"},
      landUse:{s:"Verified",src:"Zoning record",date:"2026-10-30"}
    },
    flags:["Survey plan overlaps a 12 m road reserve. Confirm the setback before building."],
    map:{poly:"105,65 275,58 285,165 125,180", pin:"198,118", gps:"-3.386, 36.652"},
    facts:{tenure:"Right of Occupancy (99 yrs)", registered:"2012-07-19", ward:"Njiro", plotNo:"451"},
    docs:["Certificate of Title (certified copy)","Survey plan (overlap noted)","Land rent receipt"]
  },
  {
    id:"P90", plot:"Plot 90, Kirumba", area:"Kirumba", district:"Ilemela", region:"Mwanza",
    listing:"MWZ-90", deed:"TD-38-20944", size:1100, landUse:"Residential",
    owner:{name:"Halima A. Nyangasa", type:"Owner"},
    seller:{name:"Lake Zone Estates", trust:2.1, listings:6},
    price:{asking:58000000, perSqm:24000, low:42000, high:60000, comps:4},
    checks:{
      owner:{s:"Flagged",src:"Record shows two competing claims on this plot",date:"2026-11-05"},
      titleDeed:{s:"Flagged",src:"Duplicate title deed number reported",date:"2026-11-05"},
      survey:{s:"Needs review",src:"Boundary markers not confirmed on site",date:"2026-11-05"},
      disputes:{s:"Flagged",src:"Pending land tribunal case (Land Case 41/2025)",date:"2026-11-05"},
      landUse:{s:"Verified",src:"Zoning record",date:"2026-11-05"}
    },
    flags:["Two competing ownership claims are recorded on this plot.",
           "Duplicate title deed number reported.",
           "Pending land tribunal case (Land Case 41/2025).",
           "Price is far below the market range. Ask why."],
    map:{poly:"100,75 255,62 288,155 138,188", pin:"188,122", gps:"-2.523, 32.917"},
    facts:{tenure:"Disputed", registered:"2020-03-11", ward:"Kirumba", plotNo:"90"},
    docs:["Title deed (duplicate reported)","Survey plan","No valid land rent receipt"]
  }
];

window.WAZI_FIND = function(q){
  q = (q||"").trim().toLowerCase();
  if(!q) return null;
  var digits = q.replace(/[^0-9]/g,"");

  // 1) exact identifier match (id, listing code, deed number)
  var exact = window.WAZI_DATA.find(function(p){
    return p.id.toLowerCase() === q ||
           p.listing.toLowerCase() === q ||
           p.deed.toLowerCase() === q;
  });
  if(exact) return exact;

  // 2) exact plot number match ("124" -> Plot 124)
  if(digits){
    var byNo = window.WAZI_DATA.filter(function(p){
      var m = p.plot.match(/(\d+)/);
      return m && m[1] === digits.replace(/^0+/,'');
    });
    if(byNo.length) return byNo[0];
  }

  // 3) substring match across names, areas, districts, regions
  var loose = window.WAZI_DATA.find(function(p){
    return [p.id,p.plot,p.area,p.district,p.region,p.listing,p.deed]
      .join(" ").toLowerCase().indexOf(q) !== -1;
  });
  if(loose) return loose;

  // 4) last resort: plot number contains the digits
  if(digits){
    return window.WAZI_DATA.find(function(p){
      return p.plot.replace(/[^0-9]/g,"").indexOf(digits) !== -1;
    }) || null;
  }
  return null;
};

/* Guided demo order: a clean pass, a caution, then a high-risk case. */
window.WAZI_GUIDED = ["P124","P7","P14"];
