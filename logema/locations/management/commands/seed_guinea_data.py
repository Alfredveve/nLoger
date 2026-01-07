import os
from django.core.management.base import BaseCommand
from locations.models import Region, Prefecture, SousPrefecture, Ville, Quartier, Secteur

class Command(BaseCommand):
    help = 'Seeds initial location data for Guinea (Safe & Idempotent)'

    def get_or_create_safe(self, model, **kwargs):
        """Helper to get or create a model instance, handling potential duplicates."""
        obj = model.objects.filter(**kwargs).first()
        if not obj:
            obj = model.objects.create(**kwargs)
            return obj, True
        return obj, False

    def handle(self, *args, **options):
        # We don't delete to avoid ProtectedError with properties
        self.stdout.write("Seeding location data (safe mode)...")

        data = {
            "Conakry": {
                "Conakry": ["Kaloum", "Dixinn", "Matam", "Ratoma", "Matoto"]
            },
            "Boké": {
                "Boké": ["Boké-Centre", "Bintimodiya", "Dabiss", "Kamsar", "Kanfarandé", "Kolaboui", "Malapouyah", "Sangaredi", "Sitanouti", "Tanéné"],
                "Boffa": ["Boffa-Centre", "Colia", "Douprou", "Koba-Tatema", "Lisso", "Mankountan", "Tamita", "Tougnifily"],
                "Fria": ["Fria-Centre", "Baguinet", "Banguingny", "Tormelin"],
                "Gaoual": ["Gaoual-Centre", "Foulamory", "Kakony", "Koumbia", "Kounsitel", "Malanta", "Touba", "Wendou M'Bour"],
                "Koundara": ["Koundara-Centre", "Guenguéréma", "Kamaby", "Sambailo", "Saréboido", "Termessé", "Youkounkoun"]
            },
            "Kindia": {
                "Kindia": ["Kindia-Centre", "Bangouya", "Damakania", "Friguiagbé", "Kolia", "Mambia", "Molota", "Samayah", "Souguéta"],
                "Coyah": ["Coyah-Centre", "Kouriah", "Manéah", "Wonkifong"],
                "Dubréka": ["Dubréka-Centre", "Badi", "Falessadé", "Ouassou", "Tanéné", "Tondon"],
                "Forécariah": ["Forécariah-Centre", "Alassoya", "Benty", "Farmoréah", "Kaback", "Kakossa", "Kallia", "Maferinyah", "Moussaya", "Sikhourou"],
                "Télimélé": ["Télimélé-Centre", "Bourouwal", "Daramagnaki", "Gougoudjé", "Koba", "Konsotamy", "Missira", "Santy", "Sogolon", "Tarihoye"]
            },
            "Mamou": {
                "Mamou": ["Mamou-Centre", "Bouliwel", "Dounet", "Gongoret", "Kegneko", "Konkouré", "Nyagara", "Ouré-Kaba", "Saramoussaya", "Soyah", "Teguereya", "Timbo", "Tolo"],
                "Dalaba": ["Dalaba-Centre", "Bodié", "Ditinn", "Kaala-Méria", "Kankalabé", "Kébali", "Koba", "Mafara", "Mitty", "Mombéyah"],
                "Pita": ["Pita-Centre", "Bantignel", "Bourouwal-Tappé", "Donghol-Touma", "Gongoré", "Ley-Miro", "Macé", "Ninguélandé", "Sangaréah", "Sintali", "Timbi-Madina", "Timbi-Tounni"]
            },
            "Labé": {
                "Labé": ["Labé-Centre", "Dalein", "Daralabé", "Diari", "Dionfo", "Garahé", "Hafia", "Kaalan", "Kouramangui", "Popodara", "Sannou", "Tountouroun"],
                "Koubia": ["Koubia-Centre", "Fafaya", "Gadha-Woundou", "Matakaou", "Missira", "Pilimini"],
                "Lélouma": ["Lélouma-Centre", "Balaya", "Djountou", "Herico", "Korbé", "Lafou", "Linsan", "Manda", "Parawol", "Sagalé", "Tyanguel-Bori"],
                "Mali": ["Mali-Centre", "Balaki", "Donghol-Sigon", "Dougountouny", "Fougou", "Gayah", "Hili-Mali", "Lébékéré", "Madina-Wora", "Salambandé", "Téliré", "Yimbéring"],
                "Tougué": ["Tougué-Centre", "Fatako", "Fello-Koundoua", "Kansangui", "Kollet", "Konah", "Kouratongo", "Koïn", "Tangali"]
            },
            "Faranah": {
                "Faranah": ["Faranah-Centre", "Banian", "Beindou", "Gnaléah", "Hérémakonon", "Kobikoro", "Marela", "Passayah", "Sandéniyah", "Songoyah", "Tindo", "Tiro"],
                "Dabola": ["Dabola-Centre", "Arfamoussaya", "Banko", "Bissikrima", "Dogomet", "Kankama", "Kindoyé", "Konindou", "N'Déma"],
                "Dinguiraye": ["Dinguiraye-Centre", "Banora", "Dialakoro", "Diatiféré", "Gagnakaly", "Kalinko", "Lansanayah", "Sélouma"],
                "Kissidougou": ["Kissidougou-Centre", "Albadariah", "Banama", "Beindou", "Firawa", "Gbangbadou", "Kondiadou", "Manfran", "Sangaréah", "Sécourou", "Yéndé-Millimou", "Yombiro"]
            },
            "Kankan": {
                "Kankan": ["Kankan-Centre", "Balandou", "Batyama", "Boula", "Gbérédou-Baranama", "Karifamoudia", "Koumban", "Mamouroudou", "Misamana", "Moribayah", "Sabadou-Baranama", "Tinti-Oulé", "Tokounou"],
                "Kérouané": ["Kérouané-Centre", "Banankoro", "Damaro", "Komsilila", "Linko", "Sibiribaro", "Sosso-Quémo", "Saran"],
                "Kouroussa": ["Kouroussa-Centre", "Babila", "Balato", "Banfèlè", "Baro", "Cisséla", "Douako", "Doura", "Kiniéro", "Koumana", "Komola-Koura", "Sanguiana"],
                "Mandiana": ["Mandiana-Centre", "Balandougou", "Dialakoro", "Faralako", "Kantoumaniyah", "Kiniéran", "Koundian", "Koundianakoro", "Morodou", "Niantania", "Saladou", "Sansando"],
                "Siguiri": ["Siguiri-Centre", "Bankon", "Doko", "Franwalia", "Kiniébakoro", "Kintinian", "Maléah", "Naboun", "Niagassola", "Niandankoro", "Norassoba", "Siguirini", "Yalenzou"]
            },
            "Nzérékoré": {
                "Nzérékoré": ["Nzérékoré-Centre", "Bounouma", "Gouécké", "Kobéla", "Koropara", "Koulé", "Palé", "Samoe", "Womey", "Yalenzou"],
                "Beyla": ["Beyla-Centre", "Boola", "Diara-Guéré", "Diassodou", "Fouala", "Gbackédou", "Gbéssoba", "Karala", "Kouandou", "Mousadou", "Nionsomoridou", "Samana", "Sinko", "Sokourala"],
                "Guéckédou": ["Guéckédou-Centre", "Bolodou", "Fangamadou", "Guendembou", "Kassadou", "Koundou", "Nongoa", "Ouéndé-Kénéma", "Tékoulo", "Termessadou-Dibo"],
                "Lola": ["Lola-Centre", "Bossou", "Foumbadou", "Gama", "Guéasso", "Kokota", "Laine", "N'Zoo"],
                "Macenta": ["Macenta-Centre", "Balizia", "Binikala", "Bofossou", "Daro", "Fassanjah", "Friguiagbé", "Kouankan", "Koyamah", "N'Zébéléla", "Ourémai", "Panziazou", "Sengbédou", "Sérédou", "Vassérédou", "Watanka"],
                "Yomou": ["Yomou-Centre", "Banié", "Bhéta", "Diécké", "Bowé"]
            }
        }

        for reg_name, prefs in data.items():
            region, _ = self.get_or_create_safe(Region, name=reg_name)
            for pref_name, sous_prefs in prefs.items():
                prefecture, _ = self.get_or_create_safe(Prefecture, name=pref_name, region=region)
                for sp_name in sous_prefs:
                    sp, _ = self.get_or_create_safe(SousPrefecture, name=sp_name, prefecture=prefecture)
                    ville, _ = self.get_or_create_safe(Ville, name=sp_name, sous_prefecture=sp)

        # Focus: Seed some Quartiers/Secteurs for Conakry
        for commune_name in ["Kaloum", "Dixinn", "Matam", "Ratoma", "Matoto"]:
            try:
                commune = Ville.objects.filter(name=commune_name).first()
                if not commune: continue
                
                if commune_name == "Ratoma":
                    quartiers = ["Lambanyi", "Kipé", "Ratoma", "Nongo", "Taouyah", "Cobayah"]
                elif commune_name == "Matoto":
                    quartiers = ["Lansanayah", "Enta", "Tombolia", "Matoto", "Kissosso"]
                elif commune_name == "Dixinn":
                    quartiers = ["Dixinn Gare", "Dixinn Port", "Landréah", "Camayenne"]
                elif commune_name == "Kaloum":
                    quartiers = ["Almamya", "Boulbinet", "Coronthie", "Manquepas", "Sandervalia"]
                else:
                    quartiers = []

                for q_name in quartiers:
                    quartier, _ = self.get_or_create_safe(Quartier, name=q_name, ville=commune)
                    self.get_or_create_safe(Secteur, name="Centre", quartier=quartier)
            except Exception as e:
                self.stdout.write(f"Error seeding quartiers for {commune_name}: {e}")

        self.stdout.write(self.style.SUCCESS('Seed completed successfully.'))
