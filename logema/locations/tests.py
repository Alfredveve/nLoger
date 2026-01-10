from django.test import TestCase
from django.db.utils import IntegrityError
from locations.models import Region, Prefecture, SousPrefecture, Ville, Quartier, Secteur


class LocationHierarchyTests(TestCase):
    """Tests pour la hiérarchie des locations"""
    
    def test_create_region(self):
        """Test de création d'une région."""
        region = Region.objects.create(name="Conakry")
        self.assertEqual(region.name, "Conakry")
        self.assertIsNotNone(region.id)

    def test_create_prefecture(self):
        """Test de création d'une préfecture."""
        region = Region.objects.create(name="Conakry")
        prefecture = Prefecture.objects.create(name="Kaloum", region=region)
        
        self.assertEqual(prefecture.name, "Kaloum")
        self.assertEqual(prefecture.region, region)

    def test_create_sous_prefecture(self):
        """Test de création d'une sous-préfecture."""
        region = Region.objects.create(name="Conakry")
        prefecture = Prefecture.objects.create(name="Kaloum", region=region)
        sous_prefecture = SousPrefecture.objects.create(
            name="Kaloum Centre",
            prefecture=prefecture
        )
        
        self.assertEqual(sous_prefecture.name, "Kaloum Centre")
        self.assertEqual(sous_prefecture.prefecture, prefecture)

    def test_create_ville(self):
        """Test de création d'une ville."""
        region = Region.objects.create(name="Conakry")
        prefecture = Prefecture.objects.create(name="Kaloum", region=region)
        sous_prefecture = SousPrefecture.objects.create(
            name="Kaloum Centre",
            prefecture=prefecture
        )
        ville = Ville.objects.create(
            name="Conakry Ville",
            sous_prefecture=sous_prefecture
        )
        
        self.assertEqual(ville.name, "Conakry Ville")
        self.assertEqual(ville.sous_prefecture, sous_prefecture)

    def test_create_quartier(self):
        """Test de création d'un quartier."""
        region = Region.objects.create(name="Conakry")
        prefecture = Prefecture.objects.create(name="Kaloum", region=region)
        sous_prefecture = SousPrefecture.objects.create(
            name="Kaloum Centre",
            prefecture=prefecture
        )
        ville = Ville.objects.create(
            name="Conakry Ville",
            sous_prefecture=sous_prefecture
        )
        quartier = Quartier.objects.create(name="Almamya", ville=ville)
        
        self.assertEqual(quartier.name, "Almamya")
        self.assertEqual(quartier.ville, ville)

    def test_create_secteur(self):
        """Test de création d'un secteur."""
        region = Region.objects.create(name="Conakry")
        prefecture = Prefecture.objects.create(name="Kaloum", region=region)
        sous_prefecture = SousPrefecture.objects.create(
            name="Kaloum Centre",
            prefecture=prefecture
        )
        ville = Ville.objects.create(
            name="Conakry Ville",
            sous_prefecture=sous_prefecture
        )
        quartier = Quartier.objects.create(name="Almamya", ville=ville)
        secteur = Secteur.objects.create(name="Secteur 1", quartier=quartier)
        
        self.assertEqual(secteur.name, "Secteur 1")
        self.assertEqual(secteur.quartier, quartier)

    def test_complete_hierarchy(self):
        """Test de la hiérarchie complète."""
        # Créer la hiérarchie complète
        region = Region.objects.create(name="Conakry")
        prefecture = Prefecture.objects.create(name="Kaloum", region=region)
        sous_prefecture = SousPrefecture.objects.create(
            name="Kaloum Centre",
            prefecture=prefecture
        )
        ville = Ville.objects.create(
            name="Conakry Ville",
            sous_prefecture=sous_prefecture
        )
        quartier = Quartier.objects.create(name="Almamya", ville=ville)
        secteur = Secteur.objects.create(name="Secteur 1", quartier=quartier)
        
        # Vérifier les relations
        self.assertEqual(secteur.quartier.ville.sous_prefecture.prefecture.region, region)

    def test_multiple_prefectures_per_region(self):
        """Test de plusieurs préfectures par région."""
        region = Region.objects.create(name="Conakry")
        
        prefecture1 = Prefecture.objects.create(name="Kaloum", region=region)
        prefecture2 = Prefecture.objects.create(name="Dixinn", region=region)
        prefecture3 = Prefecture.objects.create(name="Matam", region=region)
        
        self.assertEqual(region.prefectures.count(), 3)

    def test_multiple_quartiers_per_ville(self):
        """Test de plusieurs quartiers par ville."""
        region = Region.objects.create(name="Conakry")
        prefecture = Prefecture.objects.create(name="Kaloum", region=region)
        sous_prefecture = SousPrefecture.objects.create(
            name="Kaloum Centre",
            prefecture=prefecture
        )
        ville = Ville.objects.create(
            name="Conakry Ville",
            sous_prefecture=sous_prefecture
        )
        
        quartier1 = Quartier.objects.create(name="Almamya", ville=ville)
        quartier2 = Quartier.objects.create(name="Boulbinet", ville=ville)
        quartier3 = Quartier.objects.create(name="Tombo", ville=ville)
        
        self.assertEqual(ville.quartiers.count(), 3)

    def test_multiple_secteurs_per_quartier(self):
        """Test de plusieurs secteurs par quartier."""
        region = Region.objects.create(name="Conakry")
        prefecture = Prefecture.objects.create(name="Kaloum", region=region)
        sous_prefecture = SousPrefecture.objects.create(
            name="Kaloum Centre",
            prefecture=prefecture
        )
        ville = Ville.objects.create(
            name="Conakry Ville",
            sous_prefecture=sous_prefecture
        )
        quartier = Quartier.objects.create(name="Almamya", ville=ville)
        
        secteur1 = Secteur.objects.create(name="Secteur 1", quartier=quartier)
        secteur2 = Secteur.objects.create(name="Secteur 2", quartier=quartier)
        secteur3 = Secteur.objects.create(name="Secteur 3", quartier=quartier)
        
        self.assertEqual(quartier.secteurs.count(), 3)

    def test_cascade_delete_region(self):
        """Test de suppression en cascade depuis la région."""
        region = Region.objects.create(name="Conakry")
        prefecture = Prefecture.objects.create(name="Kaloum", region=region)
        sous_prefecture = SousPrefecture.objects.create(
            name="Kaloum Centre",
            prefecture=prefecture
        )
        
        # Supprimer la région devrait supprimer toute la hiérarchie
        region.delete()
        
        self.assertEqual(Prefecture.objects.filter(name="Kaloum").count(), 0)
        self.assertEqual(SousPrefecture.objects.filter(name="Kaloum Centre").count(), 0)

    def test_string_representations(self):
        """Test des représentations string de tous les modèles."""
        region = Region.objects.create(name="Conakry")
        prefecture = Prefecture.objects.create(name="Kaloum", region=region)
        sous_prefecture = SousPrefecture.objects.create(
            name="Kaloum Centre",
            prefecture=prefecture
        )
        ville = Ville.objects.create(
            name="Conakry Ville",
            sous_prefecture=sous_prefecture
        )
        quartier = Quartier.objects.create(name="Almamya", ville=ville)
        secteur = Secteur.objects.create(name="Secteur 1", quartier=quartier)
        
        self.assertEqual(str(region), "Conakry")
        self.assertEqual(str(prefecture), "Kaloum")
        self.assertEqual(str(sous_prefecture), "Kaloum Centre")
        self.assertEqual(str(ville), "Conakry Ville")
        self.assertEqual(str(quartier), "Almamya")
        self.assertEqual(str(secteur), "Secteur 1")

    def test_location_with_properties(self):
        """Test de location avec des propriétés associées."""
        from properties.models import Property
        from accounts.models import User
        
        region = Region.objects.create(name="Conakry")
        prefecture = Prefecture.objects.create(name="Kaloum", region=region)
        sous_prefecture = SousPrefecture.objects.create(
            name="Kaloum Centre",
            prefecture=prefecture
        )
        ville = Ville.objects.create(
            name="Conakry Ville",
            sous_prefecture=sous_prefecture
        )
        quartier = Quartier.objects.create(name="Almamya", ville=ville)
        secteur = Secteur.objects.create(name="Secteur 1", quartier=quartier)
        
        owner = User.objects.create_user(username='owner', password='pass123', is_proprietaire=True)
        
        # Créer des propriétés dans ce secteur
        Property.objects.create(
            owner=owner,
            title="Property 1",
            description="Test",
            property_type="APPARTEMENT",
            price=5000000,
            secteur=secteur
        )
        
        Property.objects.create(
            owner=owner,
            title="Property 2",
            description="Test",
            property_type="VILLA",
            price=10000000,
            secteur=secteur
        )
        
        self.assertEqual(secteur.properties.count(), 2)
