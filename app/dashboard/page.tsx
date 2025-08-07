import React from 'react';
import { Card, CardContent } from '@mui/material';
import { Link } from 'next/link';
import { FileText, Briefcase, ArrowRight } from 'lucide-react'

const DashboardPage = () => {
  return (
    <div>
      {/* Sales Materials Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6">
            <Link href="/sales-materials" className="block">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <FileText className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-xl font-bold mb-2">Sales Materials</h3>
              <p className="text-purple-100 text-sm">
                Zugang zu allen Verkaufsunterlagen, Broschüren und Marketing-Materialien
              </p>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6">
            <Link href="/sales-materials" className="block">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Briefcase className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-xl font-bold mb-2">Verkaufsressourcen</h3>
              <p className="text-orange-100 text-sm">
                Professionelle Tools, Templates und Strategien für erfolgreiche Verkaufsgespräche
              </p>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Header Section */}
      <div className="header-section">
        {/* Other Header Elements */}
      </div>

      {/* Main Content Section */}
      <div className="main-content-section">
        {/* Other Main Content Elements */}
      </div>
    </div>
  );
};

export default DashboardPage;
