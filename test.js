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

