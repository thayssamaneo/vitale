import 'package:flutter_test/flutter_test.dart';
import 'package:vitaleflutter/controllers/registration_controller.dart';

void main() {
  final controller = RegistrationController();

  test('accepts a valid email and rejects malformed email', () {
    expect(controller.validateEmail('rian@example.com'), isNull);
    expect(controller.validateEmail('not-an-email'), isNotNull);
  });

  test('requires a password of at least eight characters', () {
    expect(controller.validatePassword('short'), isNotNull);
    expect(controller.validatePassword('long-enough'), isNull);
  });
}
