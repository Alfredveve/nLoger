from django.db import models

class Region(models.Model):
    name = models.CharField(max_length=100, unique=True)
    def __str__(self): return self.name

class Prefecture(models.Model):
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='prefectures')
    name = models.CharField(max_length=100)
    def __str__(self): return f"{self.name} ({self.region.name})"

class SousPrefecture(models.Model):
    prefecture = models.ForeignKey(Prefecture, on_delete=models.CASCADE, related_name='sous_prefectures')
    name = models.CharField(max_length=100)
    def __str__(self): return f"{self.name} ({self.prefecture.name})"

class Ville(models.Model):
    sous_prefecture = models.ForeignKey(SousPrefecture, on_delete=models.CASCADE, related_name='villes')
    name = models.CharField(max_length=100)
    def __str__(self): return self.name

class Quartier(models.Model):
    ville = models.ForeignKey(Ville, on_delete=models.CASCADE, related_name='quartiers')
    name = models.CharField(max_length=100)
    def __str__(self): return self.name

class Secteur(models.Model):
    quartier = models.ForeignKey(Quartier, on_delete=models.CASCADE, related_name='secteurs')
    name = models.CharField(max_length=100)
    def __str__(self): return self.name
