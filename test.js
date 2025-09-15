return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {giftCards.map((card) => (
        <Card key={card.id} className="group hover:shadow-hover transition-all duration-300 bg-gradient-card border-0">
          <CardContent className="p-6">
            {/* Brand Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{card.brand}</h3>
                <Badge variant="secondary" className="text-xs">
                  {card.category}
                </Badge>
              </div>
              {card.discount > 0 && (
                <Badge className="bg-accent text-accent-foreground">
                  -{card.discount}%
                </Badge>
              )}
            </div>

            {/* Value and Price */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Värde:</span>
                <span className="font-semibold">{formatCurrency(card.value)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Pris:</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-primary">{formatCurrency(card.price)}</span>
                  {card.discount > 0 && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatCurrency(card.value)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-secondary" />
                <span className="text-sm text-muted-foreground">Giltig till:</span>
                <span className="text-sm font-medium">{formatDate(card.expiryDate)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-accent" />
                <span className="text-sm text-muted-foreground">Antal:</span>
                <span className="text-sm font-medium">{card.quantity} st</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="px-6 pb-6">
            <Button 
              className="w-full bg-primary hover:bg-primary-hover" 
              size="lg"
            >
              Köp nu - {formatCurrency(card.price)}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default GiftCardGrid;

 <button type="submit">Search</button>

  
    <label>
      <input type="checkbox" id="audioCheckbox">
      Music
    </label>

    <label>
      <input type="checkbox" id="imagesCheckbox">
      Images
    </label>

    <label>
      <input type="checkbox" id="pdfCheckbox">
      Docs
    </label>

    <label>
      <input type="checkbox" id="videoCheckbox">
      Videos
    </label>


allFiles.sort((a, b) => {
    let dateA = new Date(a.metadata.date || 0);
    let dateB = new Date(b.metadata.date || 0);
    return dateB - dateA; 
  });


  <!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Files</title>
  <!-- Link to the CSS file for styling the page -->
  <link rel="stylesheet" href="styles.css">
</head>




<body>
  <div class="container">

    <aside class="sidebar">
      <h2>Search filter</h2>
      <label><input type="datetime-local" id=""> time </label>

      <hr>

      <h2>Andra funktioner</h2>
      <button onclick="search({ sort: 'date' })">Sortera efter datum</button>
    </aside>

    <main class="main">
      <h1>Files</h1>
      <p><mark>marked</mark> files is our metadata</p>
    
      <form name="searchForm" onsubmit="search(); return false">
        <input name="term" placeholder="Search term">
        

        <div class="dropdown"  id="filetypeDropdown"> 
          <div class="dropdown-btn" onclick="ToggleDropdown()">Välj filtyper</div>
          <div class="dropdown-content">
            <label><input type="checkbox" id="audioCheckbox"> MP3</label><br>
            <label><input type="checkbox" id="videoCheckbox"> MP4</label><br>
            <label><input type="checkbox" id="imagesCheckbox"> JPG</label><br>
            <label><input type="checkbox" id="pdfCheckbox"> PDF</label>
          </div>
        </div>
        
        <button type="submit">Search</button>
      </form>

  <div class="searchResults"></div>
      <section class="searchResults">
        Search for files
      </section>
    </main>
  </div>
  

  <script src="main.js"></script>
</body>
</html>

body {
  margin: 0;
  font-family: Arial, sans-serif;
}

.container {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background: #2c3e50;
  color: white;
  padding: 20px;
}

.main {
  flex: 1;
  padding: 20px;
  background: #f4f4f4;
}

img {
  width: 200px;      /* Set image width */
  float: right;
}

.dropdown {
  position: relative;
  display: inline-block;
  margin: 10px 0;
}


.dropdown-btn {
  background: #3498db;
  color: white;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
}

.dropdown-content {
  display: none;
  position: absolute;
  background: white;
  border: 1px solid #ccc;
  padding: 10px;
  min-width: 150px;
  z-index: 1;
}

.dropdown.show .dropdown-content {
  display: block;
}

.highlight {
  background-color: rgb(238, 255, 0);
  font-weight: bold;
}