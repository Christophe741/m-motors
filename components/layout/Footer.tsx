export function Footer() {
  return (
    <footer className="border-t bg-slate-50 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-3">M-Motors</h3>
            <p className="text-sm text-muted-foreground">
              Spécialiste en vente et location longue durée de véhicules
              d'occasion depuis 1987.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Services</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Vente de véhicules d'occasion</li>
              <li>Location longue durée</li>
              <li>Service après-vente</li>
              <li>Financement</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>1 Rue du Commerce, 75001 Paris</li>
              <li>01 23 45 67 89</li>
              <li>contact@mmotors.fr</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} M-Motors. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
