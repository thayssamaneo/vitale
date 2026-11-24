import 'package:url_launcher/url_launcher.dart';

class EmergencyCallController {
  Future<bool> openDialer(String phoneNumber) {
    final dialableNumber = phoneNumber.replaceAll(RegExp(r'[^\d+]'), '');
    if (dialableNumber.isEmpty) {
      return Future.value(false);
    }

    return launchUrl(
      Uri(scheme: 'tel', path: dialableNumber),
      mode: LaunchMode.externalApplication,
    );
  }
}
