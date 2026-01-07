import React from 'react';
import { Target, Eye, Shield, Zap, Users, Globe, Building2, CheckCircle2 } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary-600/10 to-primary-900/5 dark:from-primary-600/20 dark:to-transparent -z-10"></div>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
            Redéfinir l'immobilier en <span className="bg-linear-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">Guinée</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            NLoger est la plateforme innovante qui connecte propriétaires, agents et locataires pour une expérience immobilière fluide, transparente et sécurisée.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white dark:bg-white/5">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-bold">
                <Target size={16} className="mr-2" /> Notre Mission
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Simplifier l'accès au logement</h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Notre mission est d'éliminer les barrières traditionnelles de l'immobilier en Guinée. Nous utilisons la technologie pour offrir une plateforme centralisée où trouver ou gérer un bien devient un plaisir plutôt qu'un fardeau.
              </p>
              <ul className="space-y-3">
                {[
                  "Transparence totale des prix et des biens",
                  "Processus de réservation numérisé",
                  "Support client dédié 7j/7"
                ].map((item, i) => (
                  <li key={i} className="flex items-center text-gray-700 dark:text-gray-300">
                    <CheckCircle2 size={20} className="text-primary-500 mr-3" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-12">
                <div className="card p-6 bg-primary-100 dark:bg-primary-900/20 border-none">
                  <h3 className="text-2xl font-bold text-primary-700 dark:text-primary-400">1000+</h3>
                  <p className="text-sm text-primary-600 dark:text-primary-300">Biens validés</p>
                </div>
                <div className="card p-6 bg-gray-100 dark:bg-white/5 border-none">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">50+</h3>
                  <p className="text-sm text-gray-500">Villes couvertes</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="card p-6 bg-gray-100 dark:bg-white/5 border-none">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">10k+</h3>
                  <p className="text-sm text-gray-500">Utilisateurs</p>
                </div>
                <div className="card p-6 bg-primary-600 text-white border-none">
                  <h3 className="text-2xl font-bold">98%</h3>
                  <p className="text-sm opacity-80">Satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Nos Valeurs Fondamentales</h2>
            <p className="text-gray-600 dark:text-gray-400">Ce qui nous anime au quotidien pour vous offrir le meilleur service.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: Shield, 
                title: "Confiance & Sécurité", 
                desc: "Chaque annonce est vérifiée manuellement par nos équipes pour garantir la sécurité de vos transactions." 
              },
              { 
                icon: Zap, 
                title: "Innovation Rapide", 
                desc: "Nous adoptons les dernières technologies pour rendre vos recherches plus rapides et intuitives." 
              },
              { 
                icon: Users, 
                title: "Esprit Communautaire", 
                desc: "Nous construisons un écosystème où propriétaires et locataires interagissent dans le respect mutuel." 
              }
            ].map((value, i) => (
              <div key={i} className="card p-8 hover:transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-6">
                  <value.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-primary-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/20 blur-3xl rounded-full -mr-48 -mt-48"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Solutions complètes pour l'immobilier</h2>
            <p className="text-primary-100 text-lg">Plus qu'une simple vitrine, NLoger accompagne tous les acteurs du marché.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { 
                icon: Globe, 
                title: "Recherche Géo-localisée", 
                desc: "Trouvez des biens directement sur la carte dans votre secteur favori ou à proximité de votre position." 
              },
              { 
                icon: Building2, 
                title: "Gestion de Mandats", 
                desc: "Outils avancés pour les démarcheurs et agents immobiliers pour gérer leur portefeuille de biens." 
              },
              { 
                icon: Shield, 
                title: "Vérification de Biens", 
                desc: "Service d'audit physique des logements pour assurer la conformité aux descriptions." 
              }
            ].map((service, i) => (
              <div key={i} className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-primary-400 font-bold text-xl">
                  <service.icon size={24} />
                </div>
                <h3 className="text-xl font-bold">{service.title}</h3>
                <p className="text-primary-100 opacity-80">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <div className="card p-12 bg-linear-to-r from-primary-600 to-primary-800 text-white border-none shadow-2xl">
            <h2 className="text-3xl font-bold mb-6">Prêt à commencer votre aventure immobilière ?</h2>
            <p className="text-primary-100 mb-10 max-w-2xl mx-auto">Rejoignez des milliers de Guinéens qui font confiance à NLoger pour leur recherche de logement.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-primary-700 font-bold rounded-xl hover:bg-gray-100 transition-colors">Découvrir les biens</button>
              <button className="px-8 py-4 bg-primary-500 text-white font-bold rounded-xl border border-white/20 hover:bg-primary-400 transition-colors">Devenir partenaire</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
