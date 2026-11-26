import 'package:firebase_auth/firebase_auth.dart';

import '../models/patient_profile.dart';
import '../repositories/user_profile_repository.dart';
import '../services/firebase_auth_service.dart';

class AuthController {
  AuthController({
    FirebaseAuthService? authService,
    UserProfileRepository? profileRepository,
  }) : _authService = authService ?? FirebaseAuthService(),
       _profileRepository = profileRepository ?? UserProfileRepository();

  final FirebaseAuthService _authService;
  final UserProfileRepository _profileRepository;

  User? get currentUser => _authService.currentUser;

  Future<void> register({
    required String email,
    required String password,
    required PatientProfile profile,
  }) async {
    final currentUser = _authService.currentUser;
    final user =
        currentUser ??
        (await _authService.createAccount(
          email: email,
          password: password,
        )).user;

    if (user == null) {
      throw StateError('O Firebase não retornou o usuário criado.');
    }
    if (currentUser != null &&
        currentUser.email?.toLowerCase() != email.trim().toLowerCase()) {
      throw StateError(
        'Entre com o mesmo e-mail da conta antes de completar o cadastro.',
      );
    }

    await user.updateDisplayName(profile.name);
    await _profileRepository.save(user.uid, profile);
  }

  Future<PatientProfile?> signIn({
    required String email,
    required String password,
  }) async {
    final credential = await _authService.signIn(
      email: email,
      password: password,
    );
    final user = credential.user;
    if (user == null) {
      throw StateError('O Firebase não retornou o usuário autenticado.');
    }
    return _profileRepository.getByUid(user.uid);
  }

  Future<PatientProfile?> restoreProfile() async {
    final user = _authService.currentUser;
    if (user == null) {
      return null;
    }
    return _profileRepository.getByUid(user.uid);
  }

  Future<void> signOut() => _authService.signOut();
}

String authErrorMessage(FirebaseAuthException error) {
  switch (error.code) {
    case 'email-already-in-use':
      return 'Este e-mail já tem uma conta. Tente entrar.';
    case 'invalid-email':
      return 'Confira o formato do e-mail.';
    case 'weak-password':
      return 'Escolha uma senha mais segura, com pelo menos 8 caracteres.';
    case 'invalid-credential':
    case 'user-not-found':
    case 'wrong-password':
      return 'E-mail ou senha incorretos.';
    case 'network-request-failed':
      return 'Sem conexão. Verifique a internet e tente novamente.';
    case 'too-many-requests':
      return 'Muitas tentativas. Aguarde um pouco e tente novamente.';
    case 'operation-not-allowed':
      return 'O login por e-mail ainda não está ativado no Firebase.';
    default:
      return 'Não foi possível autenticar (erro: ${error.code}).';
  }
}
