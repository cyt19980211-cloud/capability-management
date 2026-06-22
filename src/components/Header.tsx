import { Layers, Plus, LogOut, Shield, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface HeaderProps {
  onAddClick: () => void;
  totalCount: number;
  onAdminClick?: () => void;
  showAdminButton?: boolean;
}

export default function Header({ onAddClick, totalCount, onAdminClick, showAdminButton }: HeaderProps) {
  const { user, logout } = useAuthStore();

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Layers className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI自有能力管理系统</h1>
              <p className="text-white/70 text-sm">智能产品和能力信息管理平台</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="bg-white/20 px-4 py-2 rounded-full text-sm">
              共 {totalCount} 项能力
            </span>
            {showAdminButton && onAdminClick && (
              <button
                onClick={onAdminClick}
                className="flex items-center gap-2 bg-white/20 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-white/30 transition-colors"
              >
                <Shield className="w-5 h-5" />
                用户管理
              </button>
            )}
            <button
              onClick={onAddClick}
              className="flex items-center gap-2 bg-white text-indigo-600 px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-50 transition-colors shadow-md"
            >
              <Plus className="w-5 h-5" />
              新增能力
            </button>
            <div className="flex items-center gap-3 ml-2 pl-4 border-l border-white/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-sm">{user?.username}</span>
                {user?.role === 'admin' && (
                  <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full font-medium">管理员</span>
                )}
              </div>
              <button
                onClick={logout}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="退出登录"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
