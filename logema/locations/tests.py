from django.test import TestCase
from .models import Region, Prefecture, SousPrefecture, Ville, Quartier, Secteur

class LocationSetupMixin(TestCase):
    """
    Mixin pour configurer rapidement une hiérarchie géographique complète pour les tests.
    """
    def setUp(self):
        super().setUp()
        self.region = Region.objects.create(name="Conakry")
        self.prefecture = Prefecture.objects.create(name="Kaloum", region=self.region)
        self.sous_prefecture = SousPrefecture.objects.create(name="Kaloum Centre", prefecture=self.prefecture)
        self.ville = Ville.objects.create(name="Conakry Ville", sous_prefecture=self.sous_prefecture)
        self.quartier = Quartier.objects.create(name="Almamya", ville=self.ville)
        self.secteur = Secteur.objects.create(name="Secteur 1", quartier=self.quartier)

class LocationModelTests(LocationSetupMixin):
    def test_hierarchy_creation(self):
        """Vérifie que la hiérarchie est correctement liée."""
        self.assertEqual(self.secteur.quartier, self.quartier)
        self.assertEqual(self.quartier.ville, self.ville)
        self.assertEqual(self.ville.sous_prefecture, self.sous_prefecture)
        self.assertEqual(self.sous_prefecture.prefecture, self.prefecture)
        self.assertEqual(self.prefecture.region, self.region)

    def test_string_representations(self):
        """Vérifie les __str__ des modèles."""
        self.assertEqual(str(self.region), "Conakry")
        self.assertIn("Kaloum", str(self.prefecture))
