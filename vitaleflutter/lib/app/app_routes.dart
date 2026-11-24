import 'package:material_ui/material_ui.dart';

import '../models/patient_profile.dart';
import '../models/triage_result.dart';
import '../views/recommendations_screen.dart';
import '../views/registration_screen.dart';
import '../views/symptom_selection_screen.dart';

abstract final class AppRoutes {
  static const registration = '/';
  static const symptoms = '/symptoms';
  static const recommendations = '/recommendations';

  static Route<dynamic> onGenerateRoute(RouteSettings settings) {
    switch (settings.name) {
      case registration:
        return MaterialPageRoute<void>(
          settings: settings,
          builder: (_) => const RegistrationScreen(),
        );
      case symptoms:
        final profile = settings.arguments;
        if (profile is! PatientProfile) {
          throw FlutterError(
            'A rota de sintomas precisa de um PatientProfile.',
          );
        }
        return MaterialPageRoute<void>(
          settings: settings,
          builder: (_) => SymptomSelectionScreen(profile: profile),
        );
      case recommendations:
        final result = settings.arguments;
        if (result is! TriageResult) {
          throw FlutterError(
            'A rota de recomendações precisa de um TriageResult.',
          );
        }
        return MaterialPageRoute<void>(
          settings: settings,
          builder: (_) => RecommendationsScreen(result: result),
        );
      default:
        throw FlutterError('Rota não definida: ${settings.name}');
    }
  }
}
