import React from "react";
import { Search, Bell, User, Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { useSidebarStore } from "../store/sidebarStore";

const Header: React.FC = () => {
  const { t } = useTranslation();
  const { toggleVisibility } = useSidebarStore();
  const currentLanguage = i18n.language;

  const handleLanguageClick = () => {
    i18n.changeLanguage(currentLanguage === "ar" ? "en" : "ar");
  };

  return (
    <header className="bg-white border-b border-border px-6 py-4 sticky top-0 z-40 shadow-soft">
      <div className="flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleVisibility}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {t("header.welcome")}
            </h2>
            <p className="text-muted-foreground">{t("header.subtitle")}</p>
          </div>
        </div>

        {/* Language Toggle */}
        <div className="mx-auto my-4">
          <button
            className="btn-gradient rounded-md px-6 py-2 text-white font-medium transition-all hover:opacity-90"
            onClick={handleLanguageClick}
          >
            {currentLanguage === "ar"
              ? t("language.switchToEnglish")
              : t("language.switchToArabic")}
          </button>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("header.search")}
              className="pr-10 pl-10 py-2 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button className="p-2 hover:bg-secondary rounded-lg transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -left-1 w-3 h-3 bg-primary rounded-full"></span>
            </button>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium">{t("header.username")}</p>
              <p className="text-xs text-muted-foreground">{t("header.role")}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
