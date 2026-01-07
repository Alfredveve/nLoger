from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from locations.models import Region, Prefecture, SousPrefecture, Ville, Quartier, Secteur
from properties.models import Property
from decimal import Decimal
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Ajoute 4 démarcheurs avec des propriétés dans les régions spécifiées'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Début de la création des démarcheurs et propriétés...'))
        
        # Créer ou récupérer les régions
        regions_data = {
            'Mamou': self.setup_mamou_region(),
            'Labé': self.setup_labe_region(),
            'N\'zérékoré': self.setup_nzerekore_region(),
            'Kankan': self.setup_kankan_region(),
        }
        
        # Créer les démarcheurs
        demarcheurs = self.create_demarcheurs()
        
        # Créer des propriétés pour chaque démarcheur
        self.create_properties_for_demarcheurs(demarcheurs, regions_data)
        
        # Ajouter 2 propriétés supplémentaires à Bofossou
        self.create_bofossou_properties(demarcheurs, regions_data)
        
        self.stdout.write(self.style.SUCCESS('✓ Démarcheurs et propriétés créés avec succès!'))

    def setup_mamou_region(self):
        """Configure la région de Mamou avec ses préfectures"""
        region, _ = Region.objects.get_or_create(name='Mamou')
        
        # Préfecture de Mamou
        prefecture, _ = Prefecture.objects.get_or_create(
            region=region,
            name='Mamou'
        )
        
        # Sous-préfecture
        sous_pref, _ = SousPrefecture.objects.get_or_create(
            prefecture=prefecture,
            name='Mamou Centre'
        )
        
        # Ville
        ville, _ = Ville.objects.get_or_create(
            sous_prefecture=sous_pref,
            name='Mamou'
        )
        
        # Quartiers et secteurs
        quartier1, _ = Quartier.objects.get_or_create(
            ville=ville,
            name='Téguéréya'
        )
        secteur1, _ = Secteur.objects.get_or_create(
            quartier=quartier1,
            name='Secteur 1'
        )
        
        quartier2, _ = Quartier.objects.get_or_create(
            ville=ville,
            name='Porédaka'
        )
        secteur2, _ = Secteur.objects.get_or_create(
            quartier=quartier2,
            name='Secteur Central'
        )
        
        return {
            'region': region,
            'prefecture': prefecture,
            'secteurs': [secteur1, secteur2],
            'coords': [(10.3753, -12.0913), (10.3800, -12.0850)]
        }

    def setup_labe_region(self):
        """Configure la région de Labé avec ses préfectures"""
        region, _ = Region.objects.get_or_create(name='Labé')
        
        prefecture, _ = Prefecture.objects.get_or_create(
            region=region,
            name='Labé'
        )
        
        sous_pref, _ = SousPrefecture.objects.get_or_create(
            prefecture=prefecture,
            name='Labé Centre'
        )
        
        ville, _ = Ville.objects.get_or_create(
            sous_prefecture=sous_pref,
            name='Labé'
        )
        
        quartier1, _ = Quartier.objects.get_or_create(
            ville=ville,
            name='Hamdallaye'
        )
        secteur1, _ = Secteur.objects.get_or_create(
            quartier=quartier1,
            name='Secteur 1'
        )
        
        quartier2, _ = Quartier.objects.get_or_create(
            ville=ville,
            name='Daralabe'
        )
        secteur2, _ = Secteur.objects.get_or_create(
            quartier=quartier2,
            name='Secteur 2'
        )
        
        return {
            'region': region,
            'prefecture': prefecture,
            'secteurs': [secteur1, secteur2],
            'coords': [(11.3180, -12.2892), (11.3220, -12.2850)]
        }

    def setup_nzerekore_region(self):
        """Configure la région de N'zérékoré avec ses préfectures"""
        region, _ = Region.objects.get_or_create(name='N\'zérékoré')
        
        # Préfectures: Macenta, Kissidougou, Guéckédou
        prefectures_data = []
        
        # Macenta
        pref_macenta, _ = Prefecture.objects.get_or_create(
            region=region,
            name='Macenta'
        )
        sous_pref_macenta, _ = SousPrefecture.objects.get_or_create(
            prefecture=pref_macenta,
            name='Macenta Centre'
        )
        ville_macenta, _ = Ville.objects.get_or_create(
            sous_prefecture=sous_pref_macenta,
            name='Macenta'
        )
        quartier_macenta, _ = Quartier.objects.get_or_create(
            ville=ville_macenta,
            name='Centre Ville'
        )
        secteur_macenta, _ = Secteur.objects.get_or_create(
            quartier=quartier_macenta,
            name='Secteur Commercial'
        )
        
        # Kissidougou
        pref_kissidougou, _ = Prefecture.objects.get_or_create(
            region=region,
            name='Kissidougou'
        )
        sous_pref_kissidougou, _ = SousPrefecture.objects.get_or_create(
            prefecture=pref_kissidougou,
            name='Kissidougou Centre'
        )
        ville_kissidougou, _ = Ville.objects.get_or_create(
            sous_prefecture=sous_pref_kissidougou,
            name='Kissidougou'
        )
        quartier_kissidougou, _ = Quartier.objects.get_or_create(
            ville=ville_kissidougou,
            name='Kondiano'
        )
        secteur_kissidougou, _ = Secteur.objects.get_or_create(
            quartier=quartier_kissidougou,
            name='Secteur 1'
        )
        
        # Guéckédou
        pref_gueckedou, _ = Prefecture.objects.get_or_create(
            region=region,
            name='Guéckédou'
        )
        sous_pref_gueckedou, _ = SousPrefecture.objects.get_or_create(
            prefecture=pref_gueckedou,
            name='Guéckédou Centre'
        )
        ville_gueckedou, _ = Ville.objects.get_or_create(
            sous_prefecture=sous_pref_gueckedou,
            name='Guéckédou'
        )
        quartier_gueckedou, _ = Quartier.objects.get_or_create(
            ville=ville_gueckedou,
            name='Marché'
        )
        secteur_gueckedou, _ = Secteur.objects.get_or_create(
            quartier=quartier_gueckedou,
            name='Secteur Central'
        )
        
        return {
            'region': region,
            'prefecture': pref_macenta,
            'secteurs': [secteur_macenta, secteur_kissidougou, secteur_gueckedou],
            'coords': [(8.5403, -9.4708), (9.1850, -10.0990), (8.5667, -10.1333)]
        }

    def setup_kankan_region(self):
        """Configure la région de Kankan avec ses préfectures"""
        region, _ = Region.objects.get_or_create(name='Kankan')
        
        # Préfectures: Kankan, Siguiri
        
        # Kankan
        pref_kankan, _ = Prefecture.objects.get_or_create(
            region=region,
            name='Kankan'
        )
        sous_pref_kankan, _ = SousPrefecture.objects.get_or_create(
            prefecture=pref_kankan,
            name='Kankan Centre'
        )
        ville_kankan, _ = Ville.objects.get_or_create(
            sous_prefecture=sous_pref_kankan,
            name='Kankan'
        )
        quartier_kankan, _ = Quartier.objects.get_or_create(
            ville=ville_kankan,
            name='Bate Nafadji'
        )
        secteur_kankan, _ = Secteur.objects.get_or_create(
            quartier=quartier_kankan,
            name='Secteur 1'
        )
        
        # Siguiri
        pref_siguiri, _ = Prefecture.objects.get_or_create(
            region=region,
            name='Siguiri'
        )
        sous_pref_siguiri, _ = SousPrefecture.objects.get_or_create(
            prefecture=pref_siguiri,
            name='Siguiri Centre'
        )
        ville_siguiri, _ = Ville.objects.get_or_create(
            sous_prefecture=sous_pref_siguiri,
            name='Siguiri'
        )
        quartier_siguiri, _ = Quartier.objects.get_or_create(
            ville=ville_siguiri,
            name='Centre Ville'
        )
        secteur_siguiri, _ = Secteur.objects.get_or_create(
            quartier=quartier_siguiri,
            name='Secteur Commercial'
        )
        
        return {
            'region': region,
            'prefecture': pref_kankan,
            'secteurs': [secteur_kankan, secteur_siguiri],
            'coords': [(10.3853, -9.3058), (11.4167, -9.1667)]
        }

    def create_demarcheurs(self):
        """Crée 4 démarcheurs"""
        demarcheurs = []
        
        demarcheurs_data = [
            {
                'username': 'demarcheur_mamou',
                'email': 'mamou@nloger.gn',
                'first_name': 'Mamadou',
                'last_name': 'Diallo',
                'phone': '+224621234567',
            },
            {
                'username': 'demarcheur_labe',
                'email': 'labe@nloger.gn',
                'first_name': 'Abdoulaye',
                'last_name': 'Barry',
                'phone': '+224622345678',
            },
            {
                'username': 'demarcheur_nzerekore',
                'email': 'nzerekore@nloger.gn',
                'first_name': 'Sékou',
                'last_name': 'Kourouma',
                'phone': '+224623456789',
            },
            {
                'username': 'demarcheur_kankan',
                'email': 'kankan@nloger.gn',
                'first_name': 'Ibrahima',
                'last_name': 'Camara',
                'phone': '+224624567890',
            },
        ]
        
        for data in demarcheurs_data:
            user, created = User.objects.get_or_create(
                username=data['username'],
                defaults={
                    'email': data['email'],
                    'first_name': data['first_name'],
                    'last_name': data['last_name'],
                    'phone': data['phone'],
                    'is_demarcheur': True,
                    'kyc_status': 'VERIFIED',
                }
            )
            if created:
                user.set_password('demo1234')
                user.save()
                self.stdout.write(self.style.SUCCESS(f'  ✓ Démarcheur créé: {user.username}'))
            else:
                self.stdout.write(self.style.WARNING(f'  ⚠ Démarcheur existe déjà: {user.username}'))
            
            demarcheurs.append(user)
        
        return demarcheurs

    def create_properties_for_demarcheurs(self, demarcheurs, regions_data):
        """Crée des propriétés pour chaque démarcheur"""
        property_types = ['CHAMBRE_SIMPLE', 'SALON_CHAMBRE', 'APPARTEMENT']
        
        regions_list = ['Mamou', 'Labé', 'N\'zérékoré', 'Kankan']
        
        for idx, demarcheur in enumerate(demarcheurs):
            region_name = regions_list[idx]
            region_data = regions_data[region_name]
            
            # Créer 3-4 propriétés par démarcheur
            num_properties = random.randint(3, 4)
            
            for i in range(num_properties):
                property_type = property_types[i % len(property_types)]
                secteur = region_data['secteurs'][i % len(region_data['secteurs'])]
                coords = region_data['coords'][i % len(region_data['coords'])]
                
                # Générer un prix réaliste selon le type
                if property_type == 'CHAMBRE_SIMPLE':
                    price = Decimal(random.randint(150000, 350000))
                    title = f"Rentrée Couchée à {secteur.quartier.ville.name}"
                    description = f"Belle rentrée couchée dans le quartier {secteur.quartier.name}. Calme et sécurisé."
                elif property_type == 'SALON_CHAMBRE':
                    price = Decimal(random.randint(400000, 700000))
                    title = f"Salon Chambre à {secteur.quartier.ville.name}"
                    description = f"Salon chambre spacieux dans le secteur {secteur.name}. Proche des commodités."
                else:  # APPARTEMENT
                    price = Decimal(random.randint(800000, 1500000))
                    title = f"Appartement à {secteur.quartier.ville.name}"
                    description = f"Appartement moderne dans le quartier {secteur.quartier.name}. Bien équipé."
                
                property_obj, created = Property.objects.get_or_create(
                    owner=demarcheur,
                    agent=demarcheur,
                    secteur=secteur,
                    property_type=property_type,
                    defaults={
                        'title': title,
                        'description': description,
                        'price': price,
                        'latitude': coords[0],
                        'longitude': coords[1],
                        'is_available': True,
                    }
                )
                
                if created:
                    self.stdout.write(f'    ✓ Propriété créée: {title} - {price} GNF')

    def create_bofossou_properties(self, demarcheurs, regions_data):
        """Crée 2 propriétés supplémentaires dans la sous-préfecture de Bofossou"""
        # Bofossou est dans la préfecture de Macenta (Région de N'zérékoré)
        nzerekore_region = regions_data['N\'zérékoré']['region']
        
        # Récupérer la préfecture de Macenta
        prefecture, _ = Prefecture.objects.get_or_create(
            region=nzerekore_region,
            name='Macenta'
        )
        
        # Créer la sous-préfecture de Bofossou
        sous_pref_bofossou, _ = SousPrefecture.objects.get_or_create(
            prefecture=prefecture,
            name='Bofossou'
        )
        
        ville_bofossou, _ = Ville.objects.get_or_create(
            sous_prefecture=sous_pref_bofossou,
            name='Bofossou'
        )
        
        quartier_bofossou, _ = Quartier.objects.get_or_create(
            ville=ville_bofossou,
            name='Centre'
        )
        
        secteur_bofossou, _ = Secteur.objects.get_or_create(
            quartier=quartier_bofossou,
            name='Secteur Principal'
        )
        
        self.stdout.write(self.style.SUCCESS(f'  ✓ Sous-préfecture Bofossou (Macenta) créée'))
        
        # Créer 2 propriétés à Bofossou
        # Utiliser le démarcheur de N'zérékoré (index 2 dans la liste)
        demarcheur = demarcheurs[2]
        
        properties_data = [
            {
                'type': 'SALON_CHAMBRE',
                'title': 'Salon Chambre à Bofossou',
                'description': 'Salon chambre confortable dans le centre de Bofossou. Idéal pour une petite famille.',
                'price': Decimal('500000'),
                'coords': (8.4500, -9.4000), # Coordonnées proches de Macenta
            },
            {
                'type': 'APPARTEMENT',
                'title': 'Appartement à Bofossou',
                'description': 'Appartement spacieux à Bofossou. Proche du marché et des écoles.',
                'price': Decimal('1200000'),
                'coords': (8.4520, -9.3980),
            },
        ]
        
        for prop_data in properties_data:
            property_obj, created = Property.objects.get_or_create(
                owner=demarcheur,
                agent=demarcheur,
                secteur=secteur_bofossou,
                property_type=prop_data['type'],
                title=prop_data['title'],
                defaults={
                    'description': prop_data['description'],
                    'price': prop_data['price'],
                    'latitude': prop_data['coords'][0],
                    'longitude': prop_data['coords'][1],
                    'is_available': True,
                }
            )
            
            if created:
                self.stdout.write(f'    ✓ Propriété Bofossou créée: {prop_data["title"]} - {prop_data["price"]} GNF')
