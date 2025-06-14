export const getPageTitle = (pathname) => {
    const pageTitles = {
        '/admin/home': 'Dashboard Admin',
        '/admin/data-user': 'Manajemen User',
        '/admin/data-dosen': 'Manajemen Dosen',
        '/admin/data-prodi': 'Manajemen Program Studi',
        '/admin/data-matkul': 'Manajemen Mata Kuliah',
        '/admin/data-jadwal': 'Manajemen Jadwal',
        '/admin/data-plotingan': 'Manajemen Ploting',
        '/admin/data-presensi': 'Manajemen Presensi',
        '/admin/data-rekapitulasi': 'Rekapitulasi',
        '/admin/profile': 'Profil Admin',
        '/home': 'Beranda',
        '/mata-kuliah': 'Mata Kuliah',
        '/presensi': 'Presensi',
        '/rekapitulasi': 'Rekapitulasi',
        '/jadwal': 'Jadwal',
        '/profile': 'Profil Saya'
    };

    return pageTitles[pathname] || 'Aplikasi';
};