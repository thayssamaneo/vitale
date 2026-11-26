import 'package:firebase_auth/firebase_auth.dart';
import 'package:material_ui/material_ui.dart';

import '../app/app_routes.dart';
import '../controllers/auth_controller.dart';
import '../controllers/registration_controller.dart';
import 'widgets/vitale_brand.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _authController = AuthController();
  final _registrationController = RegistrationController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isSubmitting = false;
  bool _isRestoringSession = false;

  @override
  void initState() {
    super.initState();
    if (_authController.currentUser != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) => _restoreSession());
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _restoreSession() async {
    setState(() => _isRestoringSession = true);
    try {
      final profile = await _authController.restoreProfile();
      if (!mounted) {
        return;
      }

      if (profile == null) {
        Navigator.pushReplacementNamed(
          context,
          AppRoutes.registration,
          arguments: _authController.currentUser?.email,
        );
        return;
      }

      Navigator.pushReplacementNamed(
        context,
        AppRoutes.symptoms,
        arguments: profile,
      );
    } on FirebaseException catch (error) {
      _showMessage(
        'Não foi possível carregar seu perfil (${error.code}). Verifique a conexão e as regras do Firestore.',
      );
    } on FormatException {
      _showMessage(
        'Seu perfil salvo está incompleto. Entre em contato com o suporte.',
      );
    } finally {
      if (mounted) {
        setState(() => _isRestoringSession = false);
      }
    }
  }

  Future<void> _signIn() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      final profile = await _authController.signIn(
        email: _emailController.text,
        password: _passwordController.text,
      );
      if (!mounted) {
        return;
      }

      if (profile == null) {
        Navigator.pushReplacementNamed(
          context,
          AppRoutes.registration,
          arguments: _emailController.text.trim(),
        );
        return;
      }

      Navigator.pushReplacementNamed(
        context,
        AppRoutes.symptoms,
        arguments: profile,
      );
    } on FirebaseAuthException catch (error) {
      _showMessage(authErrorMessage(error));
    } on FirebaseException catch (error) {
      _showMessage(
        'Não foi possível carregar o perfil (${error.code}). Verifique as regras do Firestore.',
      );
    } on FormatException {
      _showMessage(
        'Seu perfil salvo está incompleto. Entre em contato com o suporte.',
      );
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    final isBusy = _isSubmitting || _isRestoringSession;

    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(22, 24, 22, 28),
          children: [
            const VitaleBrand(),
            const SizedBox(height: 34),
            Text(
              'Que bom ver você.',
              style: Theme.of(context).textTheme.headlineMedium
                  ?.copyWith(fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 8),
            Text(
              'Entre para continuar com cuidado e segurança.',
              style: Theme.of(context).textTheme.bodyLarge
                  ?.copyWith(color: const Color(0xFF625D59)),
            ),
            const SizedBox(height: 22),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      TextFormField(
                        controller: _emailController,
                        decoration: const InputDecoration(
                          labelText: 'E-mail',
                          prefixIcon: Icon(Icons.email_outlined),
                        ),
                        keyboardType: TextInputType.emailAddress,
                        autofillHints: const [AutofillHints.email],
                        textInputAction: TextInputAction.next,
                        validator: _registrationController.validateEmail,
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _passwordController,
                        decoration: const InputDecoration(
                          labelText: 'Senha',
                          prefixIcon: Icon(Icons.lock_outline),
                        ),
                        obscureText: true,
                        autofillHints: const [AutofillHints.password],
                        textInputAction: TextInputAction.done,
                        onFieldSubmitted: (_) => _signIn(),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Digite sua senha.';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 22),
                      FilledButton(
                        onPressed: isBusy ? null : _signIn,
                        child: isBusy
                            ? const SizedBox(
                                width: 22,
                                height: 22,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : const Text('Entrar'),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Center(
              child: TextButton(
                onPressed: isBusy
                    ? null
                    : () =>
                          Navigator.pushNamed(context, AppRoutes.registration),
                child: const Text('Ainda não tem uma conta? Cadastre-se'),
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Seus dados de saúde são privados e só podem ser acessados pela sua conta.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Color(0xFF625D59), height: 1.4),
            ),
          ],
        ),
      ),
    );
  }
}
