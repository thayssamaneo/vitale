import 'package:material_ui/material_ui.dart';

import 'app_routes.dart';
import 'vitale_theme.dart';

class VitaleApp extends StatelessWidget {
  const VitaleApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Vitale',
      debugShowCheckedModeBanner: false,
      theme: VitaleTheme.light,
      initialRoute: AppRoutes.registration,
      onGenerateRoute: AppRoutes.onGenerateRoute,
    );
  }
}
